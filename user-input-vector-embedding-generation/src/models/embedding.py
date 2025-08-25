from pydantic import BaseModel, Field


class EmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to be embedded")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "This is a sample text that will be converted to a vector embedding."
            }
        }


class EmbeddingResponse(BaseModel):
    embedding: list[float] = Field(..., description="Vector embedding of the input text")
    model_name: str = Field(..., description="Name of the embedding model used")
    text_length: int = Field(..., description="Length of the input text")
    
    class Config:
        json_schema_extra = {
            "example": {
                "embedding": [0.1, 0.2, 0.3, -0.1, -0.2],
                "model_name": "sentence-transformers/all-MiniLM-L6-v2",
                "text_length": 67
            }
        }
