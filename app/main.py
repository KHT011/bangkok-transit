from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return FileResponse("app/static/index.html")

@app.get("/styles.css")
async def styles():
    return FileResponse("app/static/styles.css")

@app.get("/app.js")
async def script():
    return FileResponse("app/static/app.js")

@app.get("/health")
async def health():
    return {"status": "healthy"}

