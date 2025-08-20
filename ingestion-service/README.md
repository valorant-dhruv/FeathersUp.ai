# Ingestion Service

A FastAPI-based service for ingesting PDF documents, generating vector embeddings using sentence-transformers, and storing them in Pinecone vector database.

## Features

- **PDF Processing**: Load and process PDF documents from specified folders
- **Text Chunking**: Split documents into configurable chunks with overlap
- **Vector Embeddings**: Generate embeddings using `sentence-transformers/all-MiniLM-L6-v2`
- **Pinecone Integration**: Store documents and embeddings in Pinecone vector database
- **RESTful API**: FastAPI-based gateway with async processing support
- **Configurable Logging**: Debug mode for development, no logging for production
- **Background Processing**: Support for both synchronous and asynchronous ingestion

## Prerequisites

- Python 3.12+
- Pinecone account and API key
- PDF files to process

## Installation

1. **Clone the repository** (if not already done)
2. **Navigate to the service directory**:
   ```bash
   cd ingestion-service
   ```

3. **Install dependencies**:
   ```bash
   pip install -e .
   ```

## Environment Configuration

Create a `.env` file in the service directory:

```bash
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
INDEX_NAME=your_pinecone_index_name

# Service Configuration
ENVIRONMENT=development  # development or production
LOG_LEVEL=DEBUG         # DEBUG, INFO, WARNING, ERROR, NONE
HOST=0.0.0.0           # Service host
PORT=8000              # Service port

# Optional: Override default data folder
DATA_FOLDER=data       # Default folder containing PDFs
```

## Usage

### Quick Start

Use the provided startup script:

```bash
./start.sh
```

### Manual Start

```bash
python main.py
```

### API Endpoints

#### 1. Health Check
```http
GET /health
```
Returns service health status.

#### 2. Start Ingestion
```http
POST /ingest
Content-Type: application/json

{
  "folder_path": "data",
  "background": false
}
```

**Parameters:**
- `folder_path` (string): Path to folder containing PDFs (default: "data")
- `background` (boolean): Process in background (default: false)

**Response:**
```json
{
  "message": "Ingestion completed successfully",
  "status": "completed",
  "documents_processed": 15
}
```

#### 3. Check Task Status
```http
GET /ingest/status/{task_id}
```
Check status of background ingestion tasks.

#### 4. Service Information
```http
GET /
```
Returns service information and available endpoints.

## API Examples

### Synchronous Ingestion
```bash
curl -X POST "http://localhost:8000/ingest" \
  -H "Content-Type: application/json" \
  -d '{"folder_path": "data", "background": false}'
```

### Background Ingestion
```bash
curl -X POST "http://localhost:8000/ingest" \
  -H "Content-Type: application/json" \
  -d '{"folder_path": "data", "background": true}'
```

### Health Check
```bash
curl http://localhost:8000/health
```

## File Structure

```
ingestion-service/
├── ingestion.py          # Core ingestion logic
├── gateway.py            # FastAPI gateway and endpoints
├── main.py               # Service entry point
├── start.sh              # Startup script
├── pyproject.toml        # Dependencies and project config
├── .env                  # Environment variables
└── data/                 # Default folder for PDF files
```

## Configuration Options

### Logging Levels
- **DEBUG**: Detailed logging for development
- **INFO**: General information and progress
- **WARNING**: Only warnings and errors
- **ERROR**: Only errors
- **NONE**: No logging (production mode)

### Environment Modes
- **development**: Full logging and debugging
- **production**: Minimal logging, optimized for performance

## Development

### Running in Development Mode
```bash
export ENVIRONMENT=development
export LOG_LEVEL=DEBUG
python main.py
```

### Running in Production Mode
```bash
export ENVIRONMENT=production
export LOG_LEVEL=NONE
python main.py
```

## Troubleshooting

### Common Issues

1. **Pinecone Connection Error**
   - Verify your API key and environment in `.env`
   - Check if the index exists in your Pinecone dashboard

2. **PDF Loading Errors**
   - Ensure PDF files are not corrupted
   - Check file permissions in the data folder

3. **Memory Issues**
   - Reduce `chunk_size` in `ingestion.py` for large documents
   - Process documents in smaller batches

### Logs
Check the console output for detailed logging information. In development mode, you'll see:
- PDF loading progress
- Chunk creation details
- Embedding generation status
- Pinecone storage confirmation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
