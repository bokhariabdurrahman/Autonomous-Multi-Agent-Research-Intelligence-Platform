"""Document processing, indexing, and management service."""

import os
import uuid
from typing import List, Optional
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import DocumentProcessingError, EntityNotFoundError
from app.models.document import Document
from app.monitoring.logger import logger
from app.rag.chunker import DocumentChunker
from app.rag.pdf_extractor import PDFExtractor
from app.rag.vector_store import vector_store


class DocumentService:
    """Manages PDF document ingestion, PyMuPDF extraction, and vector indexing."""

    def __init__(self):
        self.chunker = DocumentChunker()

    async def upload_and_index_document(
        self, db: AsyncSession, user_id: str, file: UploadFile
    ) -> Document:
        """Save PDF, extract text, generate chunks, and index into Qdrant."""
        # Validate format
        if not file.filename.lower().endswith(".pdf"):
            raise DocumentProcessingError("Only PDF documents are supported.")

        doc_id = str(uuid.uuid4())
        safe_filename = f"{doc_id}_{os.path.basename(file.filename)}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        content = await file.read()
        file_size = len(content)

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise DocumentProcessingError(f"File size exceeds maximum allowed {settings.MAX_UPLOAD_SIZE_MB}MB.")

        with open(file_path, "wb") as f:
            f.write(content)

        # Create initial DB record
        doc_record = Document(
            id=doc_id,
            user_id=user_id,
            filename=safe_filename,
            original_name=file.filename,
            file_path=file_path,
            file_size_bytes=file_size,
            mime_type="application/pdf",
            indexing_status="pending",
        )
        db.add(doc_record)
        await db.commit()
        await db.refresh(doc_record)

        try:
            # 1. Extract text and metadata via PyMuPDF
            extracted = PDFExtractor.extract_document(file_path)
            doc_record.page_count = extracted["page_count"]
            doc_record.doc_metadata = {
                "title": extracted["title"],
                "author": extracted["author"],
                "subject": extracted["subject"],
                "total_words": extracted["total_word_count"],
            }

            # 2. Chunk text
            chunks = self.chunker.chunk_pages(
                document_id=doc_id,
                document_name=file.filename,
                pages=extracted["pages"],
            )
            doc_record.chunk_count = len(chunks)

            # 3. Index chunks in Qdrant
            await vector_store.index_chunks(chunks)

            doc_record.indexing_status = "indexed"
            await db.commit()
            await db.refresh(doc_record)
            logger.info(f"Document {file.filename} ({doc_id}) successfully indexed.")
            return doc_record

        except Exception as e:
            logger.error(f"Failed to process and index document {file.filename}: {e}")
            doc_record.indexing_status = "failed"
            doc_record.error_message = str(e)
            await db.commit()
            await db.refresh(doc_record)
            raise DocumentProcessingError(f"Error indexing document: {e}")

    @staticmethod
    async def get_user_documents(db: AsyncSession, user_id: str) -> List[Document]:
        """Fetch all documents belonging to a user."""
        result = await db.execute(
            select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_document_by_id(db: AsyncSession, document_id: str, user_id: str) -> Document:
        """Fetch a specific document with user ownership check."""
        result = await db.execute(
            select(Document).where(Document.id == document_id, Document.user_id == user_id)
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise EntityNotFoundError("Document not found or access denied.")
        return doc

    @classmethod
    async def delete_document(cls, db: AsyncSession, document_id: str, user_id: str) -> None:
        """Delete document file, vector points, and database record."""
        doc = await cls.get_document_by_id(db, document_id, user_id)
        # Delete from Qdrant
        await vector_store.delete_document(document_id)
        # Delete physical file
        if os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
            except Exception as e:
                logger.warning(f"Failed to delete document file {doc.file_path}: {e}")
        # Delete from DB
        await db.delete(doc)
        await db.commit()

