from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from typing import Optional, List
import logging
from ingestion import load_all_pdfs_from_folder, setup_logger

# Setup logger
logger = setup_logger()

# Initialize FastAPI app
app = FastAPI(
    title="Ingestion Service Gateway",
    description="API Gateway for PDF ingestion and vector embedding generation",
    version="1.0.0"
)

class IngestionRequest(BaseModel):
    folder_path: str = "data"
    background: bool = False

class IngestionResponse(BaseModel):
    message: str
    status: str
    documents_processed: Optional[int] = None
    task_id: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ingestion-service",
        version="1.0.0"
    )

@app.post("/ingest", response_model=IngestionResponse)
async def ingest_pdfs(request: IngestionRequest, background_tasks: BackgroundTasks):
    try:
        folder_path = request.folder_path
        
        # Validate folder path
        if not os.path.exists(folder_path):
            raise HTTPException(
                status_code=400, 
                detail=f"Folder path '{folder_path}' does not exist"
            )
        
        if request.background:
            # Process in background
            task_id = f"ingest_{os.getpid()}_{os.getppid()}"
            background_tasks.add_task(process_ingestion_background, folder_path, task_id)
            
            logger.info(f"Started background ingestion task: {task_id}")
            return IngestionResponse(
                message="Ingestion started in background",
                status="started",
                task_id=task_id
            )
        else:
            # Process synchronously
            logger.info(f"Starting synchronous ingestion from folder: {folder_path}")
            documents = load_all_pdfs_from_folder(folder_path)
            
            # Count PDF files processed, not text chunks
            pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
            pdf_count = len(pdf_files)
            
            return IngestionResponse(
                message="Ingestion completed successfully",
                status="completed",
                documents_processed=pdf_count
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during ingestion: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/ingest/status/{task_id}")
async def get_ingestion_status(task_id: str):
    """
    Get status of a background ingestion task
    
    Args:
        task_id: The task ID returned from the ingest endpoint
    
    Returns:
        Status information about the task
    """
    # This is a simplified status endpoint
    # In a production environment, you'd want to implement proper task tracking
    return {
        "task_id": task_id,
        "status": "processing",  # Simplified - implement proper task state management
        "message": "Task is being processed"
    }

async def process_ingestion_background(folder_path: str, task_id: str):
    """
    Background task for processing ingestion
    
    Args:
        folder_path: Path to the folder containing PDFs
        task_id: Unique identifier for the task
    """
    try:
        logger.info(f"Background task {task_id}: Starting ingestion from {folder_path}")
        documents = load_all_pdfs_from_folder(folder_path)
        
        # Count PDF files processed, not text chunks
        pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
        pdf_count = len(pdf_files)
        
        logger.info(f"Background task {task_id}: Completed successfully. Processed {pdf_count} PDF files")
    except Exception as e:
        logger.error(f"Background task {task_id}: Failed with error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Ingestion Service Gateway",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "ingest": "/ingest",
            "status": "/ingest/status/{task_id}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
