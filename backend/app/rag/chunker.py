"""Text chunking for research documents."""

from typing import Any, Dict, List


class DocumentChunker:
    """Splits document pages into semantically cohesive overlapping chunks."""

    def __init__(self, chunk_size_words: int = 250, chunk_overlap_words: int = 50):
        self.chunk_size = chunk_size_words
        self.chunk_overlap = chunk_overlap_words

    def chunk_pages(
        self, document_id: str, document_name: str, pages: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Chunk a list of pages with page attribution."""
        chunks: List[Dict[str, Any]] = []
        global_chunk_idx = 0

        for page in pages:
            page_num = page["page_number"]
            text = page["text"]
            words = text.split()

            if not words:
                continue

            # If page is smaller than chunk size, emit single chunk
            if len(words) <= self.chunk_size:
                chunks.append({
                    "chunk_id": f"{document_id}_p{page_num}_c{global_chunk_idx}",
                    "document_id": document_id,
                    "document_name": document_name,
                    "page_number": page_num,
                    "chunk_index": global_chunk_idx,
                    "text": text,
                    "word_count": len(words),
                })
                global_chunk_idx += 1
                continue

            # Sliding window over words
            start = 0
            while start < len(words):
                end = min(start + self.chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_text = " ".join(chunk_words)

                chunks.append({
                    "chunk_id": f"{document_id}_p{page_num}_c{global_chunk_idx}",
                    "document_id": document_id,
                    "document_name": document_name,
                    "page_number": page_num,
                    "chunk_index": global_chunk_idx,
                    "text": chunk_text,
                    "word_count": len(chunk_words),
                })
                global_chunk_idx += 1

                if end >= len(words):
                    break
                start += self.chunk_size - self.chunk_overlap

        return chunks

