from fastapi import APIRouter
from .stations import router as stations_router
from .paths import router as paths_router

api_router = APIRouter()
api_router.include_router(stations_router, prefix="/stations", tags=["stations"])
api_router.include_router(paths_router, prefix="/paths", tags=["paths"])

@api_router.get('/health')
def health():
    return { 'status': 'ok' }

@api_router.get('/ping')
def ping():
    return { 'message': 'pong' }