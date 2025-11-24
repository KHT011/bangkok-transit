from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routes import router
from app.paths import router as paths_router
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

app.include_router(router)
app.include_router(paths_router)


@app.get("/")
async def root():
    return {
        "message": "Bangkok Railway API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

