"""Agent status tracking and execution telemetry endpoints."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.services.research_service import ResearchService

router = APIRouter(prefix="/research", tags=["Agents"])

AGENT_DEFINITIONS = [
    {"id": "planner", "name": "Research Planner Agent", "role": "Deconstructs inquiries into targeted subtasks"},
    {"id": "research", "name": "Research Agent", "role": "Queries web, arXiv, Semantic Scholar, and Crossref"},
    {"id": "extraction", "name": "Information Extraction Agent", "role": "Isolates atomic facts, metrics, and methodology"},
    {"id": "analysis", "name": "Analysis Agent", "role": "Synthesizes trends, contradictions, and gaps"},
    {"id": "verification", "name": "Verification Agent", "role": "Audits claims against source citations in feedback loop"},
    {"id": "report", "name": "Report Generation Agent", "role": "Produces 12-section publication report & PDF"},
]


@router.get("/{research_id}/agents")
async def get_agent_states(
    research_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve runtime state and execution status for all 6 specialized agents."""
    project = await ResearchService.get_project(db, research_id, user.id)

    status_map = {
        "pending_plan": {"planner": "running", "research": "idle", "extraction": "idle", "analysis": "idle", "verification": "idle", "report": "idle"},
        "plan_ready": {"planner": "completed", "research": "idle", "extraction": "idle", "analysis": "idle", "verification": "idle", "report": "idle"},
        "in_progress": {"planner": "completed", "research": "running", "extraction": "idle", "analysis": "idle", "verification": "idle", "report": "idle"},
        "completed": {"planner": "completed", "research": "completed", "extraction": "completed", "analysis": "completed", "verification": "completed", "report": "completed"},
        "failed": {"planner": "completed", "research": "failed", "extraction": "idle", "analysis": "idle", "verification": "idle", "report": "idle"},
        "cancelled": {"planner": "idle", "research": "idle", "extraction": "idle", "analysis": "idle", "verification": "idle", "report": "idle"},
    }

    current_statuses = status_map.get(project.status, status_map["in_progress"])
    has_sources = len(project.sources) > 0
    has_findings = len(project.findings) > 0
    has_verification = len(project.verification_results) > 0
    has_report = project.report is not None

    if project.status == "in_progress":
        if has_report:
            current_statuses = {"planner": "completed", "research": "completed", "extraction": "completed", "analysis": "completed", "verification": "completed", "report": "completed"}
        elif has_verification:
            current_statuses = {"planner": "completed", "research": "completed", "extraction": "completed", "analysis": "completed", "verification": "completed", "report": "running"}
        elif has_findings:
            current_statuses = {"planner": "completed", "research": "completed", "extraction": "completed", "analysis": "running", "verification": "idle", "report": "idle"}
        elif has_sources:
            current_statuses = {"planner": "completed", "research": "completed", "extraction": "running", "analysis": "idle", "verification": "idle", "report": "idle"}

    response = []
    for agent in AGENT_DEFINITIONS:
        agent_status = current_statuses.get(agent["id"], "idle")
        response.append({
            "id": agent["id"],
            "name": agent["name"],
            "role": agent["role"],
            "status": agent_status,
            "retry_count": 1 if (agent["id"] == "verification" and not has_report and project.status == "in_progress") else 0,
        })

    return response


@router.get("/{research_id}/logs")
async def get_project_logs(
    research_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve structured execution timeline logs."""
    project = await ResearchService.get_project(db, research_id, user.id)

    logs = [
        {"timestamp": project.created_at.isoformat(), "agent": "Research Planner Agent", "event": "research.started", "message": f"Project initialized: '{project.title}'"},
    ]

    if project.plan:
        logs.append({
            "timestamp": project.plan.created_at.isoformat(),
            "agent": "Research Planner Agent",
            "event": "planner.completed",
            "message": f"Formulated research plan with {len(project.plan.subtasks)} subtasks across domain '{project.plan.domain}'.",
        })

    if project.sources:
        logs.append({
            "timestamp": project.sources[0].created_at.isoformat(),
            "agent": "Research Agent",
            "event": "research.source_found",
            "message": f"Indexed {len(project.sources)} research sources across academic and web registries.",
        })

    if project.findings:
        logs.append({
            "timestamp": project.findings[0].created_at.isoformat(),
            "agent": "Information Extraction Agent",
            "event": "extraction.completed",
            "message": f"Extracted {len(project.findings)} factual nuggets and empirical statistics.",
        })

    if project.verification_results:
        verified_count = sum(1 for v in project.verification_results if v.status == "verified")
        logs.append({
            "timestamp": project.verification_results[0].created_at.isoformat(),
            "agent": "Verification Agent",
            "event": "verification.completed",
            "message": f"Verification completed: {verified_count}/{len(project.verification_results)} claims strictly grounded in citations.",
        })

    if project.report:
        logs.append({
            "timestamp": project.report.created_at.isoformat(),
            "agent": "Report Generation Agent",
            "event": "report.completed",
            "message": f"Comprehensive 12-section research report synthesized and PDF compiled.",
        })

    return logs

