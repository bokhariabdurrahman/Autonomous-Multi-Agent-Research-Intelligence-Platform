"""API routers aggregation."""

from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.research import router as research_router
from app.api.agents import router as agents_router
from app.api.documents import router as documents_router
from app.api.rag import router as rag_router
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router
from app.api.ws import router as ws_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(research_router)
api_router.include_router(agents_router)
api_router.include_router(documents_router)
api_router.include_router(rag_router)
api_router.include_router(reports_router)
api_router.include_router(analytics_router)
api_router.include_router(ws_router)

__all__ = ["api_router"]

