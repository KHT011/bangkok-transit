from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import api_router
from app.state import load_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_data()
    yield

app = FastAPI(
    title="Bangkok Railway API",
    description="API for finding shortest paths and calculating fares in Bangkok railway network",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(api_router)

app.mount("/", StaticFiles(directory="app/static", html=True), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

