import os
import glob
import logging
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

# Configure logging based on environment
def setup_logger():
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    
    if log_level == "NONE" or os.environ.get("ENVIRONMENT", "development").lower() == "production":
        logging.getLogger().setLevel(logging.CRITICAL)
        return logging.getLogger(__name__)
    
    # Configure logger for development
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG if log_level == "DEBUG" else logging.INFO)
    
    # Create console handler if it doesn't exist
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger

logger = setup_logger()

def load_all_pdfs_from_folder(folder_path="data"):
    # Check environment variables for Pinecone
    pinecone_api_key = os.environ.get("PINECONE_API_KEY")
    pinecone_env = os.environ.get("PINECONE_ENVIRONMENT")
    index_name = os.environ.get("INDEX_NAME")
    
    # Normalize index name for Pinecone (lowercase, alphanumeric + hyphens only)
    if index_name:
        index_name = index_name.lower().replace(' ', '-').replace('_', '-')
        # Remove any other special characters
        import re
        index_name = re.sub(r'[^a-z0-9-]', '', index_name)
    
    logger.info(f"Pinecone configuration check:")
    logger.info(f"  API Key: {'Set' if pinecone_api_key else 'Not set'}")
    logger.info(f"  Environment: {'Set' if pinecone_env else 'Not set'}")
    logger.info(f"  Index Name: {index_name if index_name else 'Not set'}")
    logger.info(f"  Normalized Index Name: {index_name if index_name else 'Not set'}")
    
    pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))
    
    logger.info(f"Searching for PDF files in folder: {folder_path}")
    logger.info(f"Found {len(pdf_files)} PDF files: {pdf_files}")
    
    if not pdf_files:
        logger.warning(f"No PDF files found in {folder_path} folder")
        return []
    
    all_documents = []
    
    # Initialize the sentence transformer model
    logger.info("Loading sentence transformer model...")
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    # Create embedding class for PineconeVectorStore
    class CustomEmbeddings:
        def __init__(self, model):
            self.model = model
        
        def embed_documents(self, texts):
            return self.model.encode(texts).tolist()
        
        def embed_query(self, text):
            return self.model.encode([text]).tolist()[0]
    
    embeddings = CustomEmbeddings(model)
    
    # Initialize Pinecone if configuration is available
    if pinecone_api_key and pinecone_env and index_name:
        try:
            logger.info("Initializing Pinecone...")
            pc = Pinecone(api_key=pinecone_api_key)
            
            # Check if index exists, create if it doesn't
            if not pc.has_index(index_name):
                logger.info(f"Creating Pinecone index: {index_name}")
                # Use traditional approach with correct dimensions
                pc.create_index(
                    name=index_name,
                    dimension=384,  # Dimension for all-MiniLM-L6-v2 model
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                logger.info(f"Successfully created index: {index_name}")
            else:
                logger.info(f"Using existing Pinecone index: {index_name}")
                # Check if we need to recreate the index due to dimension mismatch
                try:
                    index = pc.Index(index_name)
                    index_stats = index.describe_index_stats()
                    current_dimension = index_stats.dimension
                    if current_dimension != 384:
                        logger.info(f"Index dimension mismatch. Current: {current_dimension}, Expected: 384")
                        logger.info("Deleting existing index and recreating...")
                        pc.delete_index(index_name)
                        logger.info(f"Creating new Pinecone index: {index_name}")
                        pc.create_index(
                            name=index_name,
                            dimension=384,
                            metric="cosine",
                            spec=ServerlessSpec(
                                cloud="aws",
                                region="us-east-1"
                            )
                        )
                        logger.info(f"Successfully recreated index: {index_name}")
                except Exception as e:
                    logger.warning(f"Could not check index stats: {str(e)}")
                
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {str(e)}")
            logger.warning("Continuing without Pinecone storage...")
            pinecone_api_key = None  # Disable Pinecone operations
    
    for pdf_file in pdf_files:
        try:
            #Now we will load the pdf file using PyPDFLoader
            logger.info(f"Loading PDF: {pdf_file}")
            loader = PyPDFLoader(pdf_file)
            documents = loader.load()
            logger.info(f"Loaded {len(documents)} pages from {pdf_file}")

            #Now we will split the documents into chunks of predefine size
            text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            texts = text_splitter.split_documents(documents)
            logger.debug(f"created {len(texts)} chunks")

            # Generate embeddings for the text chunks
            logger.info("Generating embeddings...")
            text_contents = [text.page_content for text in texts]
            embeddings_list = model.encode(text_contents)
            logger.debug(f"Generated {len(embeddings_list)} embeddings")

            # Store documents and embeddings in Pinecone
            if pinecone_api_key and pinecone_env and index_name:
                try:
                    logger.info("Storing in Pinecone...")
                    # Get the index
                    index = pc.Index(index_name)
                    
                    # Prepare documents for upsert
                    vectors_to_upsert = []
                    for i, (text, embedding) in enumerate(zip(texts, embeddings_list)):
                        vectors_to_upsert.append({
                            "id": f"doc_{i}_{hash(text.page_content) % 1000000}",
                            "values": embedding.tolist(),  # Convert numpy array to list
                            "metadata": {
                                "source": pdf_file,
                                "page": getattr(text, 'metadata', {}).get('page', i),
                                "chunk_text": text.page_content
                            }
                        })
                    
                    # Upsert in batches
                    batch_size = 100
                    for i in range(0, len(vectors_to_upsert), batch_size):
                        batch = vectors_to_upsert[i:i + batch_size]
                        index.upsert(vectors=batch)
                    
                    logger.info(f"Successfully stored {len(texts)} documents in Pinecone")
                except Exception as pinecone_error:
                    logger.warning(f"Failed to store in Pinecone: {str(pinecone_error)}")
                    logger.info("Continuing without Pinecone storage...")
            else:
                logger.warning("Pinecone configuration incomplete, skipping Pinecone storage")
            
            # Add documents to the all_documents list (regardless of Pinecone success)
            all_documents.extend(texts)
            logger.info(f"Added {len(texts)} documents from {pdf_file} to processing list")

        except Exception as e:
            logger.error(f"Error loading {pdf_file}: {str(e)}")
    
    logger.info(f"Total documents loaded: {len(all_documents)}")
    return all_documents
