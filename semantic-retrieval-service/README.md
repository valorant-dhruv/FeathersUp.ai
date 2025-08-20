# Semantic Retrieval Service

A microservice for generating text embeddings and semantic search capabilities using state-of-the-art transformer models.

## Features

- **Text Embedding Generation**: Convert text to high-dimensional vector representations
- **RESTful API**: Clean, documented API endpoints
- **Configurable Models**: Support for different sentence transformer models
- **Production Ready**: Built with FastAPI, proper error handling, and logging
- **Docker Support**: Containerized deployment ready

## Architecture

The service follows clean architecture principles with clear separation of concerns:

```
src/
├── api/                    # API layer
│   ├── app.py             # FastAPI application factory
│   └── routes/            # API route handlers
│       └── embedding.py   # Embedding endpoints
├── config/                 # Configuration management
│   └── settings.py        # Environment-based settings
├── models/                 # Data models
│   └── embedding.py       # Request/response schemas
└── services/               # Business logic
    └── embedding_service.py # Embedding generation service
```

## API Endpoints

### POST `/embed/`
Generate a vector embedding for the provided text.

**Request Body:**
```json
{
  "text": "This is the text to be embedded"
}
```

**Response:**
```json
{
  "embedding": [0.1, 0.2, 0.3, ...],
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "text_length": 32
}
```



### GET `/`
Root endpoint with service information and available endpoints.

### GET `/docs`
Interactive API documentation (Swagger UI).

### GET `/redoc`
Alternative API documentation (ReDoc).

## Quick Start

### Prerequisites
- Python 3.12+
- UV package manager (recommended) or pip

### Installation

1. **Clone and navigate to the service directory:**
   ```bash
   cd semantic-retrieval-service
   ```

2. **Install dependencies:**
   ```bash
   uv sync
   ```
   Or with pip:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables (optional):**
   ```bash
   cp env.example .env
   # Edit .env with your preferred settings
   ```

4. **Run the service:**
   ```uv run main.py
   ```

The service will start on `http://localhost:8000` by default.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `dev` | Environment mode (`dev` or `prod`) |
| `HOST` | `0.0.0.0` | Server host address |
| `PORT` | `8000` | Server port |
| `RELOAD` | `false` | Enable auto-reload for development |
| `DEFAULT_MODEL` | `all-MiniLM-L6-v2` | Default embedding model |
| `TRUSTED_HOSTS` | `*` | Comma-separated list of trusted hosts |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed CORS origins |
| `LOG_LEVEL` | `INFO` | Logging level |

## Development

### Running in Development Mode
```bash
export ENVIRONMENT=dev
export RELOAD=true
python main.py
```

### Running in Production Mode
```bash
export ENVIRONMENT=prod
export RELOAD=false
export LOG_LEVEL=WARNING
python main.py
```

### Running Tests
```bash
uv run pytest
```

### Code Formatting
```bash
uv run black src/
uv run isort src/
```

### Linting
```bash
uv run flake8 src/
```

## Docker

### Build and Run
```bash
docker build -t semantic-retrieval-service .
docker run -p 8000:8000 semantic-retrieval-service
```

### Docker Compose

**Development:**
```bash
docker-compose up -d
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Model Information

The service uses the `sentence-transformers` library with the `all-MiniLM-L6-v2` model by default. This model:

- Generates 384-dimensional embeddings
- Is optimized for speed and quality
- Works well for semantic similarity and search
- Supports multiple languages

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **500 Internal Server Error**: Service or model errors
- Proper logging for debugging and monitoring

## Monitoring

- Health check endpoint for load balancers
- Structured logging with timestamps
- Model loading status tracking

## Contributing

1. Follow the existing code structure and patterns
2. Add proper error handling and logging
3. Include tests for new functionality
4. Update documentation as needed

## License

This project is licensed under the MIT License.
