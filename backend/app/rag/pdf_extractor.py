"""PDF extraction and document cleaning using PyMuPDF (fitz)."""

import os
import re
from typing import Any, Dict, List, Tuple
import pymupdf as fitz
from app.monitoring.logger import logger


class PDFExtractor:
    """Extracts structured text, pages, and metadata from PDF research documents."""

    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted PDF text: remove hyphen breaks, fix whitespace, remove null bytes."""
        text = text.replace("\x00", "")
        # Remove hyphenated linebreaks: "inter-\nnational" -> "international"
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
        # Normalize excessive whitespace while preserving paragraphs
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @classmethod
    def extract_document(cls, file_path: str) -> Dict[str, Any]:
        """Extract pages, text, and metadata from a PDF file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at {file_path}")

        doc = fitz.open(file_path)
        metadata = doc.metadata or {}
        page_count = len(doc)
        pages_data: List[Dict[str, Any]] = []

        total_word_count = 0

        for page_idx in range(page_count):
            page = doc[page_idx]
            raw_text = page.get_text("text")
            cleaned_text = cls.clean_text(raw_text)
            words = len(cleaned_text.split())
            total_word_count += words

            pages_data.append({
                "page_number": page_idx + 1,
                "text": cleaned_text,
                "word_count": words,
            })

        doc.close()

        extracted_title = metadata.get("title")
        if not extracted_title or len(extracted_title.strip()) < 3:
            # Fall back to first line of first page or filename
            if pages_data and pages_data[0]["text"]:
                first_lines = pages_data[0]["text"].split("\n")
                extracted_title = first_lines[0][:150].strip() if first_lines else os.path.basename(file_path)
            else:
                extracted_title = os.path.basename(file_path)

        return {
            "title": extracted_title,
            "author": metadata.get("author") or "Unknown Author",
            "subject": metadata.get("subject", ""),
            "page_count": page_count,
            "total_word_count": total_word_count,
            "pages": pages_data,
        }
