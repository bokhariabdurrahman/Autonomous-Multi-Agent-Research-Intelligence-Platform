"""Unit tests for citation verification logic and claim grounding."""

import pytest
from app.tools.citation_checker import CitationChecker


def test_verified_claim():
    sources = [
        {
            "source_index": 1,
            "title": "Scalable Multi-Agent Systems",
            "snippet": "Multi-agent systems improve problem solving accuracy by 34% compared to single-agent baselines in complex benchmark environments.",
        }
    ]
    claim = "Multi-agent systems improve problem solving accuracy by 34% in benchmark environments."
    outcome = CitationChecker.verify_claim(claim, sources, cited_indices=[1])

    assert outcome["status"] == "verified"
    assert outcome["confidence_score"] >= 0.70
    assert 1 in outcome["supporting_source_indices"]
    assert outcome["required_additional_research"] is False


def test_unsupported_claim():
    sources = [
        {
            "source_index": 1,
            "title": "Quantum Computing Fundamentals",
            "snippet": "Quantum entanglement permits superdense coding across qubits.",
        }
    ]
    claim = "Autonomous vehicles achieved 99.9% collision avoidance in downtown Tokyo."
    outcome = CitationChecker.verify_claim(claim, sources, cited_indices=[1])

    assert outcome["status"] == "unsupported"
    assert outcome["required_additional_research"] is True
    assert outcome["contradiction_details"] is not None

