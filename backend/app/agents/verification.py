"""Agent 5: Verification Agent and Feedback Loop Controller."""

from typing import Any, Dict, List
from app.agents.base import BaseAgent
from app.core.config import settings
from app.graph.state import ResearchGraphState
from app.monitoring.logger import logger
from app.tools.citation_checker import CitationChecker


class VerificationAgent(BaseAgent):
    """Audits claims against gathered source evidence, detects hallucinations, and controls feedback loop."""

    def __init__(self):
        super().__init__(name="Verification Agent")

    async def verify(self, state: ResearchGraphState) -> Dict[str, Any]:
        """Perform rigorous claim verification against sources."""
        findings = state.get("findings", [])
        sources = state.get("sources", [])
        analysis = state.get("analysis", {})
        retry_count = state.get("retry_count", 0)
        max_retries = state.get("max_retries", settings.MAX_VERIFICATION_RETRIES)

        claims_to_audit: List[Dict[str, Any]] = []

        # Collect claims from findings and analysis trends
        for f in findings[:6]:
            claims_to_audit.append({
                "claim": f.get("statement", ""),
                "cited_indices": [f.get("source_index", 1)],
            })

        for trend in analysis.get("patterns_and_trends", [])[:2]:
            claims_to_audit.append({
                "claim": trend,
                "cited_indices": [s.get("source_index", 1) for s in sources[:3]],
            })

        verification_results: List[Dict[str, Any]] = []
        unsupported_claims: List[str] = []

        for item in claims_to_audit:
            claim_text = item["claim"]
            cited = item["cited_indices"]
            outcome = CitationChecker.verify_claim(claim_text, sources, cited)
            verification_results.append(outcome)
            if outcome["status"] == "unsupported":
                unsupported_claims.append(claim_text)

        # Determine pass/fail status
        verification_passed = len(unsupported_claims) == 0

        # Log event details
        log_event = "verification.passed" if verification_passed else "verification.failed"
        log_msg = (
            f"Verified {len(verification_results)} claims: "
            f"{sum(1 for v in verification_results if v['status'] == 'verified')} passed, "
            f"{len(unsupported_claims)} flagged as unsupported."
        )
        if not verification_passed:
            log_msg += f" Feedback loop triggered (Retry {retry_count + 1}/{max_retries})."

        return {
            "verification_results": verification_results,
            "verification_passed": verification_passed,
            "unsupported_claims": unsupported_claims,
            "retry_count": retry_count,
            "status": "verification_completed",
            "current_agent": self.name,
            "logs": state.get("logs", []) + [{
                "agent": self.name,
                "event": log_event,
                "message": log_msg,
            }],
        }

