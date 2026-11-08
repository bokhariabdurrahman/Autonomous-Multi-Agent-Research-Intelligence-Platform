"""Report schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class ReportSectionSchema(BaseModel):
    title: str
    order: int
    content: str


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    executive_summary: str
    markdown_content: str
    pdf_url: Optional[str] = None
    sections: List[Dict[str, Any]] = []
    citation_count: int
    source_count: int
    unsupported_claims_count: int
    verification_passed: bool
    created_at: datetime
