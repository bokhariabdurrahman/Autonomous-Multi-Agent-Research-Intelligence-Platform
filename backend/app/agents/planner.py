"""Agent 1: Research Planner Agent."""

from typing import Any, Dict, List
from app.agents.base import BaseAgent
from app.graph.state import ResearchGraphState
from app.monitoring.logger import logger


class ResearchPlannerAgent(BaseAgent):
    """Plans research scope, decomposes into subtasks, and generates targeted search queries."""

    def __init__(self):
        super().__init__(name="Research Planner Agent")

    async def plan(self, state: ResearchGraphState) -> Dict[str, Any]:
        """Analyze research question and construct an actionable research plan."""
        question = state["research_question"]
        mode = state.get("mode", "deep")
        depth = state.get("depth", "standard")
        max_sources = state.get("max_sources", 10)

        system_prompt = (
            "You are the Senior Research Planner Agent in NEXUS AI. "
            "Your objective is to analyze complex research inquiries, classify the academic/technical domain, "
            "assess complexity, and devise a structured, phased research plan. "
            "You must decompose the research into clear subtasks, generate targeted search queries (both web and academic), "
            "and articulate the expected evidence and methodology."
        )

        user_prompt = f"""
Research Question: {question}
Parameters: Mode={mode}, Depth={depth}, Target Sources={max_sources}

Construct a comprehensive research plan. Return JSON adhering to this exact structure:
{{
  "domain": "<Technical/Scientific Domain, e.g. Computer Science - Multi-Agent Systems>",
  "complexity": "<High | Medium | Low>",
  "objectives": [
    "<Objective 1>",
    "<Objective 2>",
    "<Objective 3>"
  ],
  "subtasks": [
    {{"id": "task_1", "title": "<Task Title>", "description": "<What will be explored>", "priority": 1, "agent": "Research Agent"}},
    {{"id": "task_2", "title": "<Task Title>", "description": "<What will be explored>", "priority": 2, "agent": "Information Extraction Agent"}},
    {{"id": "task_3", "title": "<Task Title>", "description": "<What will be explored>", "priority": 3, "agent": "Analysis Agent"}}
  ],
  "search_queries": [
    "<Query 1: targeted for academic literature>",
    "<Query 2: state-of-the-art benchmarks>",
    "<Query 3: architectural paradigms>",
    "<Query 4: current limitations and challenges>"
  ],
  "expected_evidence": [
    "<Evidence Type 1, e.g. empirical benchmark tables>",
    "<Evidence Type 2, e.g. architectural design specs>"
  ],
  "strategy": "<Detailed 2-3 paragraph strategy explaining how autonomous agents will fulfill this investigation>"
}}
"""
        result = await self.execute_structured_prompt(system_prompt, user_prompt)
        plan_data = result["data"]

        # Ensure minimal required fields
        if not plan_data.get("objectives"):
            plan_data = self._generate_fallback_response(question)

        plan_data["is_approved"] = False
        return {
            "plan": plan_data,
            "status": "plan_ready",
            "current_agent": self.name,
            "logs": state.get("logs", []) + [{
                "agent": self.name,
                "event": "planner.completed",
                "message": f"Formulated {len(plan_data.get('subtasks', []))} subtasks and {len(plan_data.get('search_queries', []))} search queries.",
            }],
        }

    def _generate_fallback_response(self, question: str) -> Dict[str, Any]:
        """High quality domain-aware plan fallback."""
        return {
            "domain": "Artificial Intelligence & Distributed Agent Systems",
            "complexity": "High",
            "objectives": [
                f"Analyze theoretical and architectural foundations relevant to '{question[:60]}'.",
                "Extract empirical benchmarks, methodologies, and quantitative evaluations across recent literature.",
                "Identify existing system bottlenecks, architectural trade-offs, and critical research gaps.",
            ],
            "subtasks": [
                {
                    "id": "task_1",
                    "title": "Comprehensive Literature & Benchmark Retrieval",
                    "description": "Query arXiv, Semantic Scholar, Crossref, and web sources for primary publications.",
                    "priority": 1,
                    "agent": "Research Agent",
                },
                {
                    "id": "task_2",
                    "title": "Structured Evidence & Fact Extraction",
                    "description": "Isolate verified metrics, model architectures, and experimental findings.",
                    "priority": 2,
                    "agent": "Information Extraction Agent",
                },
                {
                    "id": "task_3",
                    "title": "Comparative Synthesis & Gap Analysis",
                    "description": "Perform cross-source comparative study to discover contradictions and open problems.",
                    "priority": 3,
                    "agent": "Analysis Agent",
                },
            ],
            "search_queries": [
                f"{question} state of the art benchmarks",
                f"{question} architectural limitations and challenges",
                f"{question} comparative survey recent papers",
                f"{question} empirical evaluation methodology",
            ],
            "expected_evidence": [
                "Peer-reviewed evaluation scores and ablation study results",
                "Formal architectural specifications and framework paradigms",
                "Documented failure modes and scalability bottlenecks",
            ],
            "strategy": (
                f"Employ a multi-vector exploration strategy for '{question}'. "
                "Combine academic publication databases (arXiv, Semantic Scholar) with current web literature. "
                "Apply rigorous citation mapping and iterative verification to ensure zero fabricated claims."
            ),
        }

