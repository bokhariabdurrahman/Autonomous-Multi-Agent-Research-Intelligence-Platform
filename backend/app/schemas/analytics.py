"""Analytics and usage schemas."""

from typing import Dict, List
from pydantic import BaseModel


class OverviewStatsResponse(BaseModel):
    total_projects: int
    completed_reports: int
    active_tasks: int
    failed_tasks: int
    total_sources_analyzed: int
    total_tokens_consumed: int
    estimated_total_cost_usd: float
    verification_pass_rate: float


class UsageStatsResponse(BaseModel):
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    total_cost_usd: float
    by_agent: Dict[str, int]
    by_model: Dict[str, int]


class AgentExecutionLog(BaseModel):
    id: str
    timestamp: str
    agent_name: str
    status: str
    message: str
    execution_time_seconds: float

