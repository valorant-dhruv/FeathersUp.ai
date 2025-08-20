import os
from typing import List
from pydantic import Field
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
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }


# Global settings instance
settings = Settings()
