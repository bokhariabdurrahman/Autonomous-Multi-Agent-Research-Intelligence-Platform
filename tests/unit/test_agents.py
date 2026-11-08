"""Unit tests for the 6 specialized research agents."""

import pytest
from app.agents.planner import ResearchPlannerAgent
from app.agents.research import ResearchAgent
from app.agents.extraction import InformationExtractionAgent
from app.agents.analysis import AnalysisAgent
from app.agents.verification import VerificationAgent
from app.agents.report_generation import ReportGenerationAgent


@pytest.mark.asyncio
async def test_planner_agent():
    planner = ResearchPlannerAgent()
    state = {
        "project_id": "test-proj",
        "research_question": "Explain graph-based multi-agent coordination architectures",
        "mode": "deep",
        "depth": "standard",
        "max_sources": 5,
        "logs": [],
    }
    result = await planner.plan(state)
    assert "plan" in result
    plan = result["plan"]
    assert "domain" in plan
    assert "subtasks" in plan
    assert len(plan["subtasks"]) > 0
    assert "search_queries" in plan
    assert len(plan["search_queries"]) > 0


@pytest.mark.asyncio
async def test_extraction_and_analysis_agents():
    sources = [
        {
            "source_index": 1,
            "title": "State of Agentic AI",
            "snippet": "Coordinated agents leverage cyclic state graphs for automated error recovery and verification loops.",
            "source_type": "web",
            "reliability_score": 0.9,
            "relevance_score": 0.9,
        }
    ]

    extraction_agent = InformationExtractionAgent()
    ext_result = await extraction_agent.extract({
        "research_question": "Agentic AI error recovery",
        "sources": sources,
        "logs": [],
    })
    findings = ext_result.get("findings", [])
    assert len(findings) > 0
    assert findings[0]["source_index"] == 1

    analysis_agent = AnalysisAgent()
    ana_result = await analysis_agent.analyze({
        "research_question": "Agentic AI error recovery",
        "sources": sources,
        "findings": findings,
        "logs": [],
    })
    analysis = ana_result.get("analysis", {})
    assert "comparative_analysis" in analysis
    assert "research_gaps" in analysis
    assert len(analysis["research_gaps"]) > 0


@pytest.mark.asyncio
async def test_report_generation_agent():
    sources = [
        {
            "source_index": 1,
            "title": "Agentic AI Foundations",
            "snippet": "Cyclic state graphs enable self-correcting agent teams.",
            "source_type": "arxiv",
            "authors": ["Dr. Smith"],
            "publication_date": "2024",
            "reliability_score": 0.95,
            "relevance_score": 0.92,
        }
    ]
    findings = [
        {
            "source_index": 1,
            "finding_type": "fact",
            "statement": "Cyclic state graphs enable self-correcting agent teams.",
            "evidence_quote": "Cyclic state graphs enable self-correcting agent teams.",
            "confidence": 0.95,
            "tags": ["agents"],
        }
    ]
    analysis = {
        "comparative_analysis": "Multi-agent systems exhibit higher resilience than single-agent models.",
        "patterns_and_trends": ["Graph-based architectures"],
        "limitations": ["Latency"],
        "research_gaps": [{"gap_title": "Benchmark standard", "description": "Need standardized tests", "type": "evidence_supported"}],
    }

    report_agent = ReportGenerationAgent()
    rep_result = await report_agent.generate({
        "project_id": "test_report_proj",
        "research_question": "Agentic AI Foundations",
        "plan": {"objectives": ["Analyze foundations"], "domain": "Computer Science"},
        "sources": sources,
        "findings": findings,
        "analysis": analysis,
        "verification_results": [{"status": "verified"}],
        "verification_passed": True,
        "logs": [],
    })

    report = rep_result.get("report", {})
    assert "title" in report
    assert "executive_summary" in report
    assert "markdown_content" in report
    assert len(report["sections"]) == 12
    assert report["source_count"] == 1

