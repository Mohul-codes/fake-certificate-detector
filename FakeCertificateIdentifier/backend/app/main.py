from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import shutil

from app.services.decision_engine import DecisionEngine

app = FastAPI(
    title="FakeCert AI API",
    description="API for detecting tampered and fake academic certificates.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"status": "FakeCert AI API is running"}

@app.post("/api/v1/analyze")
async def analyze_certificate(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run AI Analysis
        engine = DecisionEngine(file_path)
        result = engine.evaluate()
        
        return JSONResponse(content={
            "status": "success",
            "file_id": file_id,
            "filename": file.filename,
            "analysis": result
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up: delete file after processing to save disk space
        if os.path.exists(file_path):
            os.remove(file_path)