# Vector Embedding Integration

This document explains how vector embeddings are integrated into the ticketing system for enhanced semantic search capabilities.

## Overview

When a new ticket is created, the system automatically generates a vector embedding of the ticket's title and description using the external embedding service. This embedding is stored in the database and can be used for:

- Semantic similarity search
- Intelligent ticket categorization
- Finding related tickets
- Improving search relevance

## Architecture

```
Ticket Creation Flow:
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend      │───▶│   TicketService     │───▶│  EmbeddingService   │
│   (POST /tickets)│    │                     │    │                     │
└─────────────────┘    └─────────────────────┘    └─────────────────────┘
                                │                           │
                                ▼                           ▼
                       ┌─────────────────────┐    ┌─────────────────────┐
                       │   Database          │    │  External Embedding │
                       │   (Store Ticket +   │    │  API Service       │
                       │    Embedding)       │    │  (Generate Vector)  │
                       └─────────────────────┘    └─────────────────────┘
```

## Embedding Response Structure

The embedding service generates responses with the following structure:

```python
# From embedding_service.py lines 35-39
response = EmbeddingResponse(
    embedding=embedding_vector,        # List[float] - The actual vector
    model_name=self.model_name,        # String - Model used (e.g., "sentence-transformers/all-MiniLM-L6-v2")
    text_length=len(text)             # Integer - Length of input text
)
```

**Response Fields:**
- **`embedding`**: A list of floating-point numbers representing the vector embedding
- **`model_name`**: The specific sentence transformer model used (configurable via `DEFAULT_MODEL` env var)
- **`text_length`**: Character count of the input text that was embedded

**Example Response:**
```json
{
  "embedding": [0.123, -0.456, 0.789, ...],
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "text_length": 156
}
```

## Technical Implementation Details

### Embedding Generation Process

The embedding service follows this workflow:

1. **Model Loading**: Uses lazy loading to avoid loading the model during service initialization
   ```python
   def _load_model(self) -> None:
       if self._model is None:
           self._model = SentenceTransformer(self.model_name)
   ```

2. **Text Processing**: Combines ticket title and description with newline separation
   ```python
   # In our EmbeddingService.js
   const combinedText = `${title}\n\n${description}`.trim();
   ```

3. **Vector Generation**: Uses SentenceTransformer to encode text into numerical vectors
   ```python
   embedding_vector = self._model.encode(text).tolist()
   ```

4. **Response Creation**: Wraps the vector in a structured response object
   ```python
   response = EmbeddingResponse(
       embedding=embedding_vector,
       model_name=self.model_name,
       text_length=len(text)
   )
   ```

### Model Configuration

- **Default Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Configurable**: Can be changed via `DEFAULT_MODEL` environment variable
- **Model Type**: Sentence transformer optimized for semantic similarity tasks
- **Vector Dimensions**: Typically 384 dimensions for the default model

## Components

### 1. EmbeddingService (`src/services/EmbeddingService.js`)

- **Purpose**: Handles communication with the external embedding API
- **Key Methods**:
  - `generateTicketEmbedding(title, description)`: Generates embeddings for ticket content
  - `isServiceAvailable()`: Health check for the embedding service
  - `getServiceStatus()`: Returns service status and configuration

### 2. Enhanced TicketService (`src/services/TicketService.js`)

- **Modification**: `createTicketWithQueueProcessing()` now includes embedding generation
- **Process**: 
  1. Generate embedding from title + description
  2. Store embedding with ticket data
  3. Continue with normal ticket creation flow
- **Error Handling**: If embedding fails, ticket creation continues without embedding

### 3. Database Schema

- **New Field**: `embedding` column in `tickets` table
- **Type**: JSON (stores vector array)
- **Migration**: `003-add-embedding-column.js`

## Configuration

### Environment Variables

```bash
# Embedding service URL
EMBEDDING_API_URL=http://localhost:8000/embed
```

### Docker Compose

The embedding service is included in the docker-compose configuration:

```yaml
embedding-service:
  build: ../user-input-vector-embedding-generation
  container_name: feathersup_embedding
  ports:
    - "8000:8000"
  environment:
    - DEFAULT_MODEL=all-MiniLM-L6-v2
```

## Usage

### Automatic Embedding Generation

Embeddings are generated automatically when tickets are created:

```javascript
// In TicketController.createTicket()
const result = await TicketService.createTicketWithQueueProcessing(ticketData);

// Response includes embedding status
{
  ticket: {...},
  assignedAgent: {...},
  queueStats: {...},
  embeddingGenerated: true  // New field
}
```

### Manual Testing

Test the embedding service integration:

```bash
# Install dependencies
npm install

# Run embedding test
npm run test:embedding
```

## Error Handling

The system is designed to be resilient:

1. **Embedding Service Unavailable**: Ticket creation continues without embedding
2. **API Timeout**: 10-second timeout with graceful fallback
3. **Invalid Response**: Logs error but doesn't fail ticket creation
4. **Network Issues**: Handles connection failures gracefully

## Future Enhancements

1. **Semantic Search**: Use embeddings to find similar tickets
2. **Auto-categorization**: Suggest categories based on content similarity
3. **Duplicate Detection**: Identify potential duplicate tickets
4. **Intelligent Routing**: Route tickets to agents based on content similarity

## Monitoring

Check embedding service status:

```javascript
const embeddingService = new EmbeddingService();
const status = await embeddingService.getServiceStatus();
console.log(status);
// Output: { available: true, url: "...", timestamp: "..." }
```

## Troubleshooting

### Common Issues

1. **Embedding Service Not Starting**
   - Check docker-compose logs: `docker-compose logs embedding-service`
   - Verify service is accessible: `curl http://localhost:8000/embed`

2. **Embeddings Not Generated**
   - Check logs for embedding service errors
   - Verify EMBEDDING_API_URL environment variable
   - Test service manually with test script

3. **Performance Issues**
   - Monitor embedding generation time
   - Consider async embedding generation for high-volume systems
   - Implement caching for frequently used embeddings

## Security Considerations

1. **API Access**: Embedding service is internal and not exposed to external users
2. **Data Privacy**: Ticket content is processed by the embedding service
3. **Rate Limiting**: Consider implementing rate limits for embedding requests
4. **Input Validation**: Text length limits prevent abuse of embedding service
