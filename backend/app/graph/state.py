"""LangGraph shared typed state schema for NEXUS AI multi-agent workflow."""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class ResearchGraphState(TypedDict, total=False):
    """Unified state dictionary passed across all 6 LangGraph agents."""

    # Project Identifiers & Configuration
    project_id: str
    user_id: str
    research_question: str
    mode: str
    depth: str
    max_sources: int
    include_academic: bool
    selected_document_ids: List[str]

    # Agent 1: Research Planner
    plan: Dict[str, Any]
    human_approved: bool

    # Agent 2: Research Collector
    sources: List[Dict[str, Any]]

    # Agent 3: Information Extraction
    findings: List[Dict[str, Any]]

    # Agent 4: Analysis
    analysis: Dict[str, Any]

    # Agent 5: Verification & Feedback Loop
    verification_results: List[Dict[str, Any]]
    verification_passed: bool
    retry_count: int
    max_retries: int
    unsupported_claims: List[str]

    # Agent 6: Report Generation
    report: Dict[str, Any]

    # Workflow Metadata & Diagnostics
    status: str
    current_agent: str
    logs: List[Dict[str, Any]]
    token_usage: Dict[str, int]
    error: Optional[str]

