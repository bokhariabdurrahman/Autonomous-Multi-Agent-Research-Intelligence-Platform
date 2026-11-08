"""Agent 2: Research Agent."""

from typing import Any, Dict, List
from app.agents.base import BaseAgent
from app.graph.state import ResearchGraphState
from app.monitoring.logger import logger
from app.rag.vector_store import vector_store
from app.tools.academic_search import AcademicSearchTool
from app.tools.tavily_search import TavilySearchTool


class ResearchAgent(BaseAgent):
    """Executes multi-channel research across Web (Tavily), Academic (arXiv/Semantic Scholar/Crossref), and RAG."""

    def __init__(self):
        super().__init__(name="Research Agent")
        self.tavily = TavilySearchTool()
        self.academic = AcademicSearchTool()

    async def execute(self, state: ResearchGraphState) -> Dict[str, Any]:
        """Collect and deduplicate research sources."""
        plan = state.get("plan", {})
        queries = plan.get("search_queries", [state["research_question"]])
        max_sources = state.get("max_sources", 10)
        include_academic = state.get("include_academic", True)
        doc_ids = state.get("selected_document_ids", [])
        unsupported = state.get("unsupported_claims", [])

        # If this is a verification retry, prepend targeted queries for the unsupported claims
        if unsupported:
            targeted_queries = [f"evidence for {claim[:60]}" for claim in unsupported[:2]]
            queries = targeted_queries + queries

        collected_sources: List[Dict[str, Any]] = list(state.get("sources", []))
        seen_titles = {s.get("title", "").strip().lower() for s in collected_sources}

        # 1. Search uploaded document vector store (RAG) if user selected documents
        if doc_ids:
            try:
                for q in queries[:2]:
                    rag_chunks = await vector_store.search(q, document_ids=doc_ids, top_k=3)
                    for chunk in rag_chunks:
                        title = f"Document: {chunk.get('document_name', 'Uploaded File')} (p.{chunk.get('page_number', 1)})"
                        if title.lower() not in seen_titles:
                            seen_titles.add(title.lower())
                            collected_sources.append({
                                "title": title,
                                "url": f"local://documents/{chunk.get('document_id')}",
                                "snippet": chunk.get("text", ""),
                                "authors": ["Uploaded Research Document"],
                                "publication_date": "2024-2026",
                                "source_type": "pdf",
                                "reliability_score": 0.98,
                                "relevance_score": chunk.get("score", 0.90),
                            })
            except Exception as e:
                logger.warning(f"RAG search error during research execution: {e}")

        # 2. Search Academic Sources (arXiv, Semantic Scholar, Crossref)
        if include_academic:
            for q in queries[:3]:
                if len(collected_sources) >= max_sources:
                    break
                try:
                    academic_results = await self.academic.search_all(q, max_per_source=2)
                    for paper in academic_results:
                        norm = paper.get("title", "").strip().lower()
                        if norm and norm not in seen_titles:
                            seen_titles.add(norm)
                            collected_sources.append(paper)
                except Exception as e:
                    logger.warning(f"Academic search error for query '{q}': {e}")

        # 3. Search Web Sources (Tavily)
        for q in queries[:3]:
            if len(collected_sources) >= max_sources:
                break
            try:
                web_results = await self.tavily.search(q, max_results=3)
                for item in web_results:
                    norm = item.get("title", "").strip().lower()
                    if norm and norm not in seen_titles:
                        seen_titles.add(norm)
                        collected_sources.append(item)
            except Exception as e:
                logger.warning(f"Web search error for query '{q}': {e}")

        # Sort by relevance and reliability, limit to max_sources, assign 1-based index
        collected_sources.sort(
            key=lambda x: (x.get("reliability_score", 0.8) + x.get("relevance_score", 0.8)),
            reverse=True,
        )
        final_sources = collected_sources[:max_sources]
        for idx, src in enumerate(final_sources, start=1):
            src["source_index"] = idx

        return {
            "sources": final_sources,
            "status": "research_completed",
            "current_agent": self.name,
            "logs": state.get("logs", []) + [{
                "agent": self.name,
                "event": "research.source_found",
                "message": f"Successfully gathered and ranked {len(final_sources)} sources ({sum(1 for s in final_sources if s.get('source_type') != 'web')} academic/doc, {sum(1 for s in final_sources if s.get('source_type') == 'web')} web).",
            }],
        }

