"""Qdrant vector store integration for semantic retrieval."""

import uuid
from typing import Any, Dict, List, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.core.config import settings
from app.monitoring.logger import logger
from app.rag.embeddings import embedding_service


class VectorStoreService:
    """Manages document vector storage and semantic retrieval via Qdrant."""

    _instance: Optional["VectorStoreService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreService, cls).__new__(cls)
            cls._instance._init_client()
        return cls._instance

    def _init_client(self):
        """Connect to remote Qdrant or fall back seamlessly to local in-memory/disk store."""
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.client: Optional[QdrantClient] = None

        if settings.QDRANT_URL and settings.QDRANT_URL != ":memory:":
            try:
                client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY or None,
                    timeout=3.0,
                    check_compatibility=False,
                )
                # Test connectivity
                client.get_collections()
                self.client = client
                logger.info(f"Connected to remote Qdrant at {settings.QDRANT_URL}")
            except Exception as e:
                logger.warning(
                    f"Could not connect to Qdrant at {settings.QDRANT_URL} ({e}). "
                    f"Using embedded in-memory Qdrant client."
                )
                self.client = QdrantClient(":memory:")
        else:
            self.client = QdrantClient(":memory:")

        self._ensure_collection()

    def _ensure_collection(self):
        """Ensure vector collection exists with cosine distance."""
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)
            if not exists:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=embedding_service.dimension,
                        distance=qmodels.Distance.COSINE,
                    ),
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error ensuring Qdrant collection: {e}")

    async def index_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Embed and upsert document chunks into Qdrant."""
        if not chunks:
            return 0

        texts = [c["text"] for c in chunks]
        vectors = embedding_service.embed_texts(texts)

        points = []
        for i, chunk in enumerate(chunks):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk["chunk_id"]))
            points.append(
                qmodels.PointStruct(
                    id=point_id,
                    vector=vectors[i],
                    payload={
                        "chunk_id": chunk["chunk_id"],
                        "document_id": chunk["document_id"],
                        "document_name": chunk["document_name"],
                        "page_number": chunk["page_number"],
                        "chunk_index": chunk["chunk_index"],
                        "text": chunk["text"],
                        "word_count": chunk.get("word_count", 0),
                    },
                )
            )

        self.client.upsert(
            collection_name=self.collection_name,
            points=points,
        )
        logger.info(f"Indexed {len(points)} chunks into Qdrant.")
        return len(points)

    async def search(
        self, query: str, document_ids: Optional[List[str]] = None, top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Perform semantic search with optional document filtering."""
        query_vector = embedding_service.embed_query(query)

        query_filter = None
        if document_ids:
            query_filter = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="document_id",
                        match=qmodels.MatchAny(any=document_ids),
                    )
                ]
            )

        try:
            # Query Qdrant with support for query_points (qdrant-client >= 1.10) and legacy search
            if hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    query_filter=query_filter,
                    limit=top_k,
                )
                hits = response.points
            elif hasattr(self.client, "search"):
                hits = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    query_filter=query_filter,
                    limit=top_k,
                )
            else:
                hits = []

            results = []
            for hit in hits:
                payload = hit.payload or {}
                results.append({
                    "chunk_id": payload.get("chunk_id"),
                    "document_id": payload.get("document_id"),
                    "document_name": payload.get("document_name"),
                    "page_number": payload.get("page_number", 1),
                    "chunk_index": payload.get("chunk_index", 0),
                    "text": payload.get("text", ""),
                    "score": round(float(hit.score), 4) if hasattr(hit, "score") and hit.score is not None else 0.9,
                })
            return results
        except Exception as e:
            logger.error(f"Error during Qdrant search: {e}")
            return []

    async def delete_document(self, document_id: str) -> None:
        """Remove all chunks associated with a specific document ID."""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=qmodels.FilterSelector(
                    filter=qmodels.Filter(
                        must=[
                            qmodels.FieldCondition(
                                key="document_id",
                                match=qmodels.MatchValue(value=document_id),
                            )
                        ]
                    )
                ),
            )
            logger.info(f"Deleted vector chunks for document {document_id}")
        except Exception as e:
            logger.warning(f"Could not delete document chunks from Qdrant: {e}")


vector_store = VectorStoreService()
