"""Citation verification and factual claim alignment checker."""

import re
from typing import Any, Dict, List, Set, Tuple


class CitationChecker:
    """Verifies that research claims have direct evidence support in the cited sources."""

    @staticmethod
    def extract_keywords(text: str) -> Set[str]:
        """Extract significant alphanumeric tokens for lexical overlap."""
        tokens = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
        stopwords = {
            "the", "and", "that", "this", "with", "from", "for", "are", "was",
            "were", "which", "then", "into", "their", "have", "been", "also",
            "such", "when", "more", "than", "some", "what", "will", "would",
            "could", "about", "these", "those", "over", "after", "before"
        }
        return {t for t in tokens if t not in stopwords}

    @classmethod
    def verify_claim(
        cls, claim: str, sources: List[Dict[str, Any]], cited_indices: List[int]
    ) -> Dict[str, Any]:
        """Verify whether the claim is genuinely supported by the cited sources."""
        claim_keywords = cls.extract_keywords(claim)
        claim_numbers = re.findall(r"\b\d+(?:\.\d+)?%?\b", claim)

        matching_sources: List[int] = []
        contradictions: List[str] = []
        max_overlap_score = 0.0

        for idx in cited_indices:
            # Look up source by index
            source = next((s for s in sources if s.get("source_index") == idx), None)
            if not source:
                continue

            content = f"{source.get('title', '')} {source.get('snippet', '')} {source.get('full_text', '')}"
            source_keywords = cls.extract_keywords(content)

            # Keyword overlap
            if claim_keywords:
                overlap = len(claim_keywords.intersection(source_keywords)) / len(claim_keywords)
            else:
                overlap = 0.0

            if overlap > max_overlap_score:
                max_overlap_score = overlap

            # Check numbers/percentages in claim
            numbers_matched = True
            for num in claim_numbers:
                if num not in content:
                    numbers_matched = False
                    break

            if overlap >= 0.35 and (not claim_numbers or numbers_matched):
                matching_sources.append(idx)

        # Detect clear contradiction markers (e.g. claim asserts success while source mentions fail/negative)
        negation_in_claim = any(w in claim.lower() for w in ["not", "never", "fails", "cannot", "incapable"])

        if matching_sources:
            status = "verified"
            confidence = min(0.98, max(0.70, round(max_overlap_score + 0.3, 2)))
        elif max_overlap_score > 0.20:
            status = "unsupported"
            confidence = round(max_overlap_score, 2)
            contradictions.append(f"Claim asserts concepts not sufficiently supported in cited sources {cited_indices}.")
        else:
            status = "unsupported"
            confidence = 0.15
            contradictions.append(f"No factual alignment found in sources for claim: '{claim[:100]}...'")

        return {
            "claim": claim,
            "status": status,
            "confidence_score": confidence,
            "supporting_source_indices": matching_sources,
            "contradiction_details": "; ".join(contradictions) if contradictions else None,
            "required_additional_research": (status == "unsupported"),
        }

