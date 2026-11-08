"""Research project lifecycle and execution endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.exceptions import EntityNotFoundError
from app.database.session import get_db
from app.models.user import User
from app.schemas.research import (
    ResearchCreateRequest,
    ResearchPlanApprovalRequest,
    ResearchProjectDetail,
    ResearchProjectSummary,
)
from app.services.research_service import ResearchService

router = APIRouter(prefix="/research", tags=["Research"])


@router.post("", response_model=ResearchProjectDetail, status_code=status.HTTP_201_CREATED)
async def create_research_project(
    data: ResearchCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Submit a complex research inquiry to trigger the Research Planner Agent."""
    project = await ResearchService.create_project(db, user.id, data)
    project_detail = await ResearchService.get_project(db, project.id, user.id)
    return project_detail


@router.get("", response_model=List[ResearchProjectSummary])
async def list_research_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve history of user research inquiries."""
    return await ResearchService.list_projects(db, user.id, skip=skip, limit=limit)


@router.get("/{research_id}", response_model=ResearchProjectDetail)
async def get_research_project(
    research_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve full project details including sources, findings, and verification outcomes."""
    try:
        return await ResearchService.get_project(db, research_id, user.id)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.post("/{research_id}/approve", response_model=ResearchProjectDetail)
async def approve_research_plan(
    research_id: str,
    approval: ResearchPlanApprovalRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Human-in-the-loop: Approve, edit, or reject the proposed research plan."""
    try:
        project = await ResearchService.approve_and_execute_plan(db, research_id, user.id, approval)
        return await ResearchService.get_project(db, project.id, user.id)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.post("/{research_id}/cancel")
async def cancel_research_project(
    research_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Cancel an active research inquiry."""
    try:
        await ResearchService.cancel_project(db, research_id, user.id)
        return {"message": "Research project cancelled."}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.delete("/{research_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_research_project(
    research_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a research project and associated artifacts."""
    try:
        await ResearchService.delete_project(db, research_id, user.id)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

