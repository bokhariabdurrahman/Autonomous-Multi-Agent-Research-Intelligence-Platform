"""LangGraph multi-agent workflow definition, conditional edges, and execution engine."""

import time
from typing import Any, Dict, Literal
from langgraph.graph import END, StateGraph
from app.agents.analysis import AnalysisAgent
from app.agents.extraction import InformationExtractionAgent
from app.agents.planner import ResearchPlannerAgent
from app.agents.report_generation import ReportGenerationAgent
from app.agents.research import ResearchAgent
from app.agents.verification import VerificationAgent
from app.core.config import settings
from app.graph.state import ResearchGraphState
from app.monitoring.logger import logger
from app.services.ws_manager import ws_manager

# Instantiate singleton agents
planner_agent = ResearchPlannerAgent()
research_agent = ResearchAgent()
extraction_agent = InformationExtractionAgent()
analysis_agent = AnalysisAgent()
verification_agent = VerificationAgent()
report_agent = ReportGenerationAgent()


async def planner_node(state: ResearchGraphState) -> Dict[str, Any]:
    """Node: Formulate research plan."""
    project_id = state.get("project_id", "")
    await ws_manager.broadcast_event(project_id, "planner.started", {"message": "Decomposing research query..."})
    update = await planner_agent.plan(state)
    await ws_manager.broadcast_event(project_id, "planner.completed", {"plan": update.get("plan")})
    return update


async def research_node(state: ResearchGraphState) -> Dict[str, Any]:
    """Node: Query external APIs and RAG."""
    project_id = state.get("project_id", "")
    is_retry = state.get("retry_count", 0) > 0
    await ws_manager.broadcast_event(
        project_id,
        "research.started",
        {"message": f"Querying arXiv, Semantic Scholar, Crossref, and web... (Cycle {state.get('retry_count', 0) + 1})"},
    )
    update = await research_agent.execute(state)
    await ws_manager.broadcast_event(
        project_id,
        "research.completed",
        {"sources_count": len(update.get("sources", []))},
    )
    return update


async def extraction_node(state: ResearchGraphState) -> Dict[str, Any]:
    """Node: Extract structured facts and metrics."""
    project_id = state.get("project_id", "")
    await ws_manager.broadcast_event(
        project_id, "extraction.started", {"message": "Extracting facts, metrics, and methodology nuggets..."}
    )
    update = await extraction_agent.extract(state)
    await ws_manager.broadcast_event(
        project_id, "extraction.completed", {"findings_count": len(update.get("findings", []))}
    )
    return update


async def analysis_node(state: ResearchGraphState) -> Dict[str, Any]:
    """Node: Synthesize trends, contradictions, and gaps."""
    project_id = state.get("project_id", "")
    await ws_manager.broadcast_event(
        project_id, "analysis.started", {"message": "Synthesizing cross-source evidence and discovering research gaps..."}
    )
    update = await analysis_agent.analyze(state)
    await ws_manager.broadcast_event(
        project_id, "analysis.completed", {"analysis": update.get("analysis")}
    )
    return update


async def verification_node(state: ResearchGraphState) -> Dict[str, Any]:
    """Node: Audit claim-to-source alignment."""
    project_id = state.get("project_id", "")
    await ws_manager.broadcast_event(
        project_id, "verification.started", {"message": "Auditing claim grounding against evidence..."}
    )
    update = await verification_agent.verify(state)
    passed = update.get("verification_passed", True)
    event_type = "verification.passed" if passed else "verification.failed"
    await ws_manager.broadcast_event(
        project_id,
        event_type,
        {
            "verification_passed": passed,
            "unsupported_claims": update.get("unsupported_claims", []),
            "retry_count": update.get("retry_count", 0),
        },
    )
    return update


async def report_node(state: ResearchGraphState) -> Dict[str, Any]:
    """Node: Compile final publication report and generate PDF."""
    project_id = state.get("project_id", "")
    await ws_manager.broadcast_event(
        project_id, "report.generating", {"message": "Compiling 12-section report and generating publication PDF..."}
    )
    update = await report_agent.generate(state)
    await ws_manager.broadcast_event(
        project_id, "report.completed", {"report_title": update.get("report", {}).get("title")}
    )
    return update


def route_after_verification(state: ResearchGraphState) -> Literal["research_node", "report_node"]:
    """Conditional edge decision: retry research if verification failed and retries remain."""
    passed = state.get("verification_passed", True)
    retries = state.get("retry_count", 0)
    max_retries = state.get("max_retries", settings.MAX_VERIFICATION_RETRIES)

    if passed or retries >= max_retries:
        return "report_node"

    # Increment retry counter and route back to research
    state["retry_count"] = retries + 1
    logger.info(f"Routing back to research_node (Retry {state['retry_count']}/{max_retries})")
    return "research_node"


def build_research_graph() -> StateGraph:
    """Build the compiled LangGraph execution graph."""
    builder = StateGraph(ResearchGraphState)

    # Add all 6 agent nodes
    builder.add_node("planner_node", planner_node)
    builder.add_node("research_node", research_node)
    builder.add_node("extraction_node", extraction_node)
    builder.add_node("analysis_node", analysis_node)
    builder.add_node("verification_node", verification_node)
    builder.add_node("report_node", report_node)

    # Edges
    builder.set_entry_point("planner_node")
    # From planner, we stop for human approval or proceed to research
    builder.add_edge("planner_node", "research_node")
    builder.add_edge("research_node", "extraction_node")
    builder.add_edge("extraction_node", "analysis_node")
    builder.add_edge("analysis_node", "verification_node")

    # Conditional feedback loop from verification
    builder.add_conditional_edges(
        "verification_node",
        route_after_verification,
        {
            "research_node": "research_node",
            "report_node": "report_node",
        },
    )
    builder.add_edge("report_node", END)

    return builder.compile()


research_graph = build_research_graph()

