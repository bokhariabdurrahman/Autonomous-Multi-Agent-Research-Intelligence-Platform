"""RAG semantic search and document querying endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.rag.vector_store import vector_store
from app.schemas.document import DocumentQueryRequest, DocumentQueryResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post("/query", response_model=DocumentQueryResponse)
async def query_documents(
    query_data: DocumentQueryRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Execute semantic vector retrieval across uploaded user documents with citation mapping."""
    user_docs = await DocumentService.get_user_documents(db, user.id)
    user_doc_ids = {d.id for d in user_docs}

    # Filter to requested document IDs that the user owns
    filter_doc_ids = None
    if query_data.document_ids:
        filter_doc_ids = [d for d in query_data.document_ids if d in user_doc_ids]
    else:
        filter_doc_ids = list(user_doc_ids)

    if not filter_doc_ids:
        return DocumentQueryResponse(query=query_data.query, results=[])

    hits = await vector_store.search(
        query=query_data.query,
        document_ids=filter_doc_ids,
        top_k=query_data.top_k,
    )

    results = []
    for h in hits:
        results.append({
            "document_id": h.get("document_id", ""),
            "document_name": h.get("document_name", "Document"),
            "page_number": h.get("page_number", 1),
            "chunk_index": h.get("chunk_index", 0),
            "text": h.get("text", ""),
            "score": h.get("score", 0.0),
        })

    return DocumentQueryResponse(query=query_data.query, results=results)

