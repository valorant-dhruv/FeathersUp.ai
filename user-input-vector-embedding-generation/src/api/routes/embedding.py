from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import logging

from ...models.embedding import EmbeddingRequest, EmbeddingResponse
from ...services.embedding_service import EmbeddingService

# Initialize router
#Prefix is the path that will be used to access the endpoint
#Tags is the name of the endpoint and is used for documentation purposes in Swagger UI
router = APIRouter(prefix="/embed", tags=["embeddings"])

# Initialize service
embedding_service = EmbeddingService()

# Initialize logger
logger = logging.getLogger(__name__)


@router.post("/", response_model=EmbeddingResponse, status_code=status.HTTP_200_OK)
async def create_embedding(request: EmbeddingRequest) -> EmbeddingResponse:
    try:
        logger.info(f"Received embedding request for text of length {len(request.text)}")
        
        # Generate embedding using the service
        response = embedding_service.generate_embedding(request.text)
        
        logger.info(f"Successfully generated embedding with {len(response.embedding)} dimensions")
        return response
        
    except RuntimeError as e:
        logger.error(f"Service error during embedding generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate embedding: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during embedding generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the embedding"
        )



