#!/usr/bin/env python3
"""Test script to verify imports work correctly."""

import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_imports():
    """Test that all critical imports work."""
    try:
        logger.info("Testing imports...")
        
        # Test basic imports
        from src.config.settings import settings
        logger.info("✓ Settings imported successfully")
        
        from src.api.app import create_app
        logger.info("✓ App factory imported successfully")
        
        from src.services.embedding_service import EmbeddingService
        logger.info("✓ EmbeddingService imported successfully")
        
        from src.models.embedding import EmbeddingResponse
        logger.info("✓ EmbeddingResponse imported successfully")
        
        # Test app creation (without starting server)
        app = create_app(environment="dev")
        logger.info("✓ App created successfully")
        
        logger.info("All imports successful! The service should work properly.")
        return True
        
    except ImportError as e:
        logger.error(f"Import error: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)
