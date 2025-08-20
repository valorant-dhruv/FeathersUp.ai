import uvicorn
import os
import logging
from dotenv import load_dotenv
from gateway import app

# Load environment variables
load_dotenv()

# Configure logging
def setup_logging():
    """Setup logging configuration based on environment"""
    log_level = os.environ.get("LOG_LEVEL", "info").lower()
    
    # Validate log level and set fallback
    valid_levels = ["critical", "error", "warning", "info", "debug", "trace"]
    if log_level not in valid_levels:
        logging.warning(f"Invalid LOG_LEVEL '{log_level}', falling back to 'info'")
        log_level = "info"
    
    # Configure logging
    if os.environ.get("ENVIRONMENT", "development").lower() == "production":
        logging.basicConfig(level=logging.ERROR)
    else:
        logging.basicConfig(
            level=getattr(logging, log_level.upper()),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    return log_level

def main():
    """Main function to run the ingestion service"""
    # Setup logging first
    log_level = setup_logging()
    logger = logging.getLogger(__name__)
    
    # Get configuration from environment variables
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    
    logger.info(f"Starting Ingestion Service on {host}:{port}")
    logger.info("Available endpoints:")
    logger.info("  - GET  /health - Health check")
    logger.info("  - POST /ingest - Start PDF ingestion")
    logger.info("  - GET  /ingest/status/{task_id} - Check task status")
    logger.info("  - GET  / - Service information")
    
    # Run the FastAPI application
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level=log_level
    )

if __name__ == "__main__":
    main()
