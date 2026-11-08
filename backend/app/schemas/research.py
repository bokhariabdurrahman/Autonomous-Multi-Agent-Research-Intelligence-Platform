"""Research request and response schemas."""

from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ResearchCreateRequest(BaseModel):
    research_question: str = Field(..., min_length=10, description="The research question or topic")
    mode: str = Field("deep", description="Research mode: quick, deep, or academic")
    depth: str = Field("standard", description="standard or exhaustive")
    max_sources: int = Field(10, ge=3, le=50)
    include_academic: bool = Field(True, description="Whether to query arXiv, Semantic Scholar, Crossref")
    selected_document_ids: List[str] = Field(default_factory=list, description="IDs of uploaded PDFs to include")


class ResearchPlanApprovalRequest(BaseModel):
    approved: bool = True
    feedback: Optional[str] = None
    edited_subtasks: Optional[List[dict]] = None
    edited_search_queries: Optional[List[str]] = None


class SubtaskSchema(BaseModel):
    id: str
    title: str
    description: str
    priority: int = 1
    agent: str = "Research Agent"


class ResearchPlanSchema(BaseModel):
    domain: str
    complexity: str
    objectives: List[str]
    subtasks: List[dict]
    search_queries: List[str]
    expected_evidence: List[str]
    strategy: str
    is_approved: bool = False
    user_feedback: Optional[str] = None


class SourceSchema(BaseModel):
    id: Optional[str] = None
    source_index: int
    title: str
    url: Optional[str] = None
    source_type: str
    authors: List[str] = []
    publication_date: Optional[str] = None
    snippet: str
    reliability_score: float = 0.8
    relevance_score: float = 0.8


class FindingSchema(BaseModel):
    id: Optional[str] = None
    source_id: Optional[str] = None
    finding_type: str
    statement: str
    evidence_quote: Optional[str] = None
    confidence: float = 0.9
    tags: List[str] = []


class VerificationSchema(BaseModel):
    id: Optional[str] = None
    claim: str
    status: str  # verified, unsupported, contradicted
    confidence_score: float = 0.9
    supporting_source_indices: List[int] = []
    contradiction_details: Optional[str] = None
    required_additional_research: bool = False


class AgentExecutionSchema(BaseModel):
    id: str
    agent_name: str
    status: str
    input_state: dict = {}
    output_state: dict = {}
    error_message: Optional[str] = None
    retry_count: int = 0
    execution_time_seconds: float = 0.0
    created_at: datetime


class ResearchProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    research_question: str
    mode: str
    depth: str
    status: str
    created_at: datetime
    updated_at: datetime


class ResearchProjectDetail(ResearchProjectSummary):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    max_sources: int
    include_academic: bool
    selected_document_ids: List[str] = []
    plan: Optional[ResearchPlanSchema] = None
    sources: List[SourceSchema] = []
    findings: List[FindingSchema] = []
    verification_results: List[VerificationSchema] = []
    error_message: Optional[str] = None
