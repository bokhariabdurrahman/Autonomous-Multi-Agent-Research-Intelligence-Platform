"""Document and RAG schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    original_name: str
    file_size_bytes: int
    mime_type: str
    page_count: int
    chunk_count: int
    indexing_status: str
    doc_metadata: Dict[str, Any] = {}
    error_message: Optional[str] = None
    created_at: datetime


class DocumentQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    top_k: int = 5


class DocumentChunkResult(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    chunk_index: int
    text: str
    score: float


class DocumentQueryResponse(BaseModel):
    query: str
    results: List[DocumentChunkResult]
