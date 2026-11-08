"""Integration tests for RAG chunking, embedding generation, and vector retrieval."""

import pytest
from app.rag.chunker import DocumentChunker
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store


def test_document_chunker():
    chunker = DocumentChunker(chunk_size_words=10, chunk_overlap_words=2)
    pages = [
        {
            "page_number": 1,
            "text": "The quick brown fox jumps over the lazy dog in the middle of a sunny day.",
        }
    ]
    chunks = chunker.chunk_pages("doc_1", "Test Doc", pages)
    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["document_id"] == "doc_1"


def test_embedding_service():
    texts = ["Multi-agent collaboration", "Autonomous research intelligence"]
    embeddings = embedding_service.embed_texts(texts)
    assert len(embeddings) == 2
    assert len(embeddings[0]) == embedding_service.dimension


@pytest.mark.asyncio
async def test_vector_store_indexing_and_search():
    chunks = [
        {
            "chunk_id": "test_chunk_1",
            "document_id": "doc_rag_test",
            "document_name": "Agentic AI Overview.pdf",
            "page_number": 1,
            "chunk_index": 0,
            "text": "Agentic architectures deploy decentralized agents interacting over typed shared state graphs.",
            "word_count": 12,
        }
    ]
    indexed_count = await vector_store.index_chunks(chunks)
    assert indexed_count == 1

    results = await vector_store.search("decentralized agents state graphs", document_ids=["doc_rag_test"], top_k=1)
    assert len(results) > 0
    assert results[0]["document_id"] == "doc_rag_test"
    assert "Agentic architectures" in results[0]["text"]

