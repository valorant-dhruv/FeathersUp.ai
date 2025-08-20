import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Environment configuration
    environment: str = Field(default="dev", env="ENVIRONMENT")
    
    # Server configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    reload: bool = Field(default=False, env="RELOAD")
    
    # Model configuration
    default_model: str = Field(default="all-MiniLM-L6-v2", env="DEFAULT_MODEL")
    
    # Security configuration
    trusted_hosts: List[str] = Field(default=["*"], env="TRUSTED_HOSTS")
    cors_origins: List[str] = Field(default=["*"], env="CORS_ORIGINS")
    
    # Logging configuration
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    @field_validator('trusted_hosts', 'cors_origins', mode='before')
    @classmethod
    def parse_list_fields(cls, v):
        """Convert string values to lists for trusted_hosts and cors_origins."""
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            # Try to parse as JSON if it looks like a JSON string
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    return json.loads(v)
                except:
                    pass
            # Split by comma if it's a comma-separated string
            return [item.strip() for item in v.split(",") if item.strip()]
        return v
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }


# Global settings instance
settings = Settings()
