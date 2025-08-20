import uvicorn
import logging
from src.api.app import app
from src.config.settings import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


def main():
    """Main entry point for the semantic retrieval service."""
    try:
        logger.info(f"Starting Semantic Retrieval Service on {settings.host}:{settings.port}")
        logger.info(f"Environment: {settings.environment}")
        logger.info(f"Reload mode: {settings.reload}")
        
        # Start the server
        uvicorn.run(
            "src.api.app:app",
            host=settings.host,
            port=settings.port,
            reload=settings.reload,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        logger.info("Service stopped by user")
    except Exception as e:
        logger.error(f"Failed to start service: {str(e)}")
        raise


if __name__ == "__main__":
    main()
