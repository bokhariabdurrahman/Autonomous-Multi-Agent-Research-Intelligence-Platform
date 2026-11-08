"""Report retrieval and export service."""

import os
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.models.report import Report
from app.models.research import ResearchProject


class ReportService:
    """Manages report retrieval and PDF downloads."""

    @staticmethod
    async def get_report_by_id(db: AsyncSession, report_id: str, user_id: str) -> Report:
        """Fetch report ensuring owning project belongs to user."""
        result = await db.execute(
            select(Report)
            .join(ResearchProject, Report.project_id == ResearchProject.id)
            .where(Report.id == report_id, ResearchProject.user_id == user_id)
        )
        report = result.scalar_one_or_none()
        if not report:
            raise EntityNotFoundError("Report not found or access denied.")
        return report

    @staticmethod
    async def get_report_by_project(db: AsyncSession, project_id: str, user_id: str) -> Report:
        """Fetch report by project ID."""
        result = await db.execute(
            select(Report)
            .join(ResearchProject, Report.project_id == ResearchProject.id)
            .where(Report.project_id == project_id, ResearchProject.user_id == user_id)
        )
        report = result.scalar_one_or_none()
        if not report:
            raise EntityNotFoundError("Report not found for this project.")
        return report

    @staticmethod
    async def list_reports(db: AsyncSession, user_id: str, skip: int = 0, limit: int = 20) -> List[Report]:
        """List all generated reports for a user."""
        result = await db.execute(
            select(Report)
            .join(ResearchProject, Report.project_id == ResearchProject.id)
            .where(ResearchProject.user_id == user_id)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

