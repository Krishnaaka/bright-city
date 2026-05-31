from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from prometheus_fastapi_instrumentator import Instrumentator
from app.main import router as api_router
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bright City 2 API")

# Create static directory if not exists
os.makedirs("static/uploads", exist_ok=True)

# Mount static files under /api/static
app.mount("/api/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Prometheus Metrics ──────────────────────────────────────────────────────
# Exposes /metrics endpoint for Prometheus scraping
Instrumentator().instrument(app).expose(app)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Bright City 2 API", "status": "running"}
