"""Integration tests for FastAPI endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "NEXUS AI"


@pytest.mark.asyncio
async def test_auth_register_and_login(client: AsyncClient):
    email = "researcher_test@nexus-ai.org"
    password = "secure_password_987"

    # Register
    reg_resp = await client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Test Researcher"},
    )
    assert reg_resp.status_code in (201, 400)  # 400 if already exists

    # Login
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_research_lifecycle(client: AsyncClient):
    # Create inquiry
    create_resp = await client.post(
        "/api/research",
        json={
            "research_question": "Investigate multi-agent coordination frameworks and benchmark datasets",
            "mode": "deep",
            "depth": "standard",
            "max_sources": 5,
            "include_academic": True,
        },
    )
    assert create_resp.status_code == 201
    project = create_resp.json()
    project_id = project["id"]
    assert project["status"] in ("pending_plan", "plan_ready")

    # Get project detail
    get_resp = await client.get(f"/api/research/{project_id}")
    assert get_resp.status_code == 200
    detail = get_resp.json()
    assert detail["id"] == project_id

    # Check agent states
    agents_resp = await client.get(f"/api/research/{project_id}/agents")
    assert agents_resp.status_code == 200
    agents = agents_resp.json()
    assert len(agents) == 6

    # Approve plan
    approve_resp = await client.post(
        f"/api/research/{project_id}/approve",
        json={"approved": True, "feedback": "Proceed with analysis."},
    )
    assert approve_resp.status_code == 200
    updated_project = approve_resp.json()
    assert updated_project["status"] in ("in_progress", "completed")


@pytest.mark.asyncio
async def test_analytics_endpoints(client: AsyncClient):
    overview_resp = await client.get("/api/analytics/overview")
    assert overview_resp.status_code == 200
    data = overview_resp.json()
    assert "total_projects" in data
    assert "completed_reports" in data

    usage_resp = await client.get("/api/analytics/usage")
    assert usage_resp.status_code == 200
    usage_data = usage_resp.json()
    assert "total_tokens" in usage_data
    assert "by_agent" in usage_data
