"""Report retrieval and export endpoints."""

import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.exceptions import EntityNotFoundError
from app.database.session import get_db
from app.models.user import User
from app.schemas.report import ReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[ReportResponse])
async def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve all synthesized reports for current user."""
    return await ReportService.list_reports(db, user.id, skip=skip, limit=limit)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve detailed report including all 12 structured markdown sections."""
    try:
        return await ReportService.get_report_by_id(db, report_id, user.id)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get("/{report_id}/download")
async def download_report_pdf(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Download the publication-quality PDF report."""
    try:
        report = await ReportService.get_report_by_id(db, report_id, user.id)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

    if not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF document file is not available on disk.",
        )

    safe_title = "".join(c for c in report.title if c.isalnum() or c in (" ", "-", "_")).strip()
    download_filename = f"{safe_title[:50]}_report.pdf"

    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=download_filename,
    )

