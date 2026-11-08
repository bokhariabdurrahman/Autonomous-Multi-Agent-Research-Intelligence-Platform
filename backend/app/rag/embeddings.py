"""Embedding generation for RAG semantic search."""

import hashlib
import math
from typing import List, Optional
import numpy as np
from app.monitoring.logger import logger


class EmbeddingService:
    """Provides vector embeddings using SentenceTransformers with resilient fallbacks."""

    _instance: Optional["EmbeddingService"] = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._model = None
            cls._instance._dimension = 384
        return cls._instance

    @property
    def dimension(self) -> int:
        return self._dimension

    def _get_model(self):
        """Lazy loader for SentenceTransformer to minimize startup time."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info("Initializing SentenceTransformer('all-MiniLM-L6-v2')...")
                self._model = SentenceTransformer("all-MiniLM-L6-v2")
                self._dimension = 384
                logger.info("SentenceTransformer successfully loaded.")
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer: {e}. Using deterministic semantic projection.")
                self._model = False
        return self._model

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a list of texts."""
        if not texts:
            return []

        model = self._get_model()
        if model:
            try:
                embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error during SentenceTransformer encoding: {e}")

        # High-entropy fallback embedding for offline or constrained test environments
        return [self._hash_embed(t, self._dimension) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        """Embed a single search query."""
        results = self.embed_texts([query])
        return results[0] if results else [0.0] * self._dimension

    @staticmethod
    def _hash_embed(text: str, dim: int = 384) -> List[float]:
        """Deterministic normalized dense vector fallback based on token hashing."""
        words = text.lower().split()
        vec = np.zeros(dim, dtype=np.float32)
        if not words:
            return vec.tolist()

        for word in words:
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            for i in range(4):
                idx = (h >> (i * 8)) % dim
                weight = 1.0 / math.sqrt(len(words))
                vec[idx] += weight

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()


embedding_service = EmbeddingService()

