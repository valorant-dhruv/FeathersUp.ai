from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging

from ..config.settings import settings
from .routes.embedding import router as embedding_router


def create_app(environment: str = "dev") -> FastAPI:

    # Validate environment
    if environment not in ["dev", "prod"]:
        raise ValueError("Environment must be 'dev' or 'prod'")
    
    # Configure logging based on environment
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    if environment == "dev":
        logging.basicConfig(
            level=logging.DEBUG,
            format=log_format
        )
    else:
        logging.basicConfig(
            level=getattr(logging, settings.log_level),
            format=log_format
        )
    
    # Create FastAPI app with environment-specific configuration
    if environment == "dev":
        app = FastAPI(
            title="Semantic Retrieval Service (Development)",
            description="A microservice for generating text embeddings and semantic search - Development Mode",
            version="0.1.0",
            docs_url="/docs",
            redoc_url="/redoc",
            debug=True
        )
    else:
        app = FastAPI(
            title="Semantic Retrieval Service",
            description="A microservice for generating text embeddings and semantic search",
            version="0.1.0",
            docs_url="/docs",
            redoc_url="/redoc",
            debug=False
        )
    
    # Configure CORS based on environment
    if environment == "dev":
        # Development: Allow all origins for easier development
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        # Production: Use configured CORS settings
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Configure trusted hosts based on environment
    if environment == "dev":
        # Development: Allow all hosts
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"]
        )
    else:
        # Production: Use configured trusted hosts
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.trusted_hosts
        )
    
    # Include routers
    app.include_router(embedding_router)
    
    # Root endpoint with environment information
    @app.get("/", tags=["root"])
    async def root():
        """Root endpoint providing service information."""
        return {
            "service": "Semantic Retrieval Service",
            "version": "0.1.0",
            "status": "running",
            "environment": environment,
            "endpoints": {
                "docs": "/docs",
                "embed": "/embed/"
            }
        }
    
    return app


# Create app instance - default to development environment
# This can be overridden by passing environment parameter when calling create_app()
app = create_app(environment="dev")
