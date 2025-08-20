from typing import List
import logging
from sentence_transformers import SentenceTransformer

from ..config.settings import settings
from ..models.embedding import EmbeddingResponse


class EmbeddingService:
    
    def __init__(self, model_name: str = None):
        self.model_name = f"sentence-transformers/{model_name or settings.default_model}"
        self.logger = logging.getLogger(__name__)
        self._model = None
        
    def _load_model(self) -> None:
        """Lazy load the embedding model to avoid loading it during service initialization."""
        if self._model is None:
            try:
                self.logger.info(f"Loading embedding model: {self.model_name}")
                self._model = SentenceTransformer(self.model_name)
                self.logger.info(f"Successfully loaded model: {self.model_name}")
            except Exception as e:
                self.logger.error(f"Failed to load model {self.model_name}: {str(e)}")
                raise RuntimeError(f"Failed to load embedding model: {str(e)}")
    
    def generate_embedding(self, text: str) -> EmbeddingResponse:
        try:
            self._load_model()
            
            # Generate embedding
            embedding_vector = self._model.encode(text).tolist()
            
            # Create response
            response = EmbeddingResponse(
                embedding=embedding_vector,
                model_name=self.model_name,
                text_length=len(text)
            )
            
            self.logger.info(f"Generated embedding for text of length {len(text)}")
            return response
            
        except Exception as e:
            self.logger.error(f"Failed to generate embedding: {str(e)}")
            raise RuntimeError(f"Failed to generate embedding: {str(e)}")
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model."""
        if self._model is None:
            return {"status": "not_loaded"}
        
        return {
            "status": "loaded",
            "model_name": self.model_name,
            "max_seq_length": self._model.max_seq_length if hasattr(self._model, 'max_seq_length') else "unknown"
        }
