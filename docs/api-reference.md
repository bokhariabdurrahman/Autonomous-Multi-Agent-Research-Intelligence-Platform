# NEXUS AI: REST & WebSocket API Reference

Base API Path: `/api`  
Interactive Swagger Docs: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

## 1. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new researcher account | No |
| `POST` | `/api/auth/login` | Authenticate with credentials and retrieve JWT | No |
| `POST` | `/api/auth/logout` | Client-side session invalidation | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |

## 2. Research Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/research` | Submit research inquiry & trigger Planner Agent | Yes (Bearer) |
| `GET` | `/api/research` | List user's research projects with pagination | Yes (Bearer) |
| `GET` | `/api/research/{id}` | Get complete project with sources & findings | Yes (Bearer) |
| `POST` | `/api/research/{id}/approve` | Human-in-the-loop: Approve or edit research plan | Yes (Bearer) |
| `POST` | `/api/research/{id}/cancel` | Cancel an active research inquiry | Yes (Bearer) |
| `DELETE` | `/api/research/{id}` | Delete research project and all artifacts | Yes (Bearer) |

## 3. Agent Telemetry & Logs

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/research/{id}/agents` | Retrieve runtime states for all 6 agents | Yes (Bearer) |
| `GET` | `/api/research/{id}/logs` | Retrieve structured timeline execution logs | Yes (Bearer) |

## 4. Document Library & RAG

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/documents/upload` | Upload PDF: extracts, chunks, embeds, indexes | Yes (Bearer) |
| `GET` | `/api/documents` | List uploaded user documents | Yes (Bearer) |
| `GET` | `/api/documents/{id}` | Get metadata and status of single document | Yes (Bearer) |
| `DELETE` | `/api/documents/{id}` | Delete document file, DB record, and vectors | Yes (Bearer) |
| `POST` | `/api/rag/query` | Semantic vector query across indexed papers | Yes (Bearer) |

## 5. Reports & Analytics

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reports` | List all synthesized research reports | Yes (Bearer) |
| `GET` | `/api/reports/{id}` | Get full report with 12 structured sections | Yes (Bearer) |
| `GET` | `/api/reports/{id}/download` | Download publication-grade PDF file | Yes (Bearer) |
| `GET` | `/api/analytics/overview` | Platform overview KPIs for dashboard | Yes (Bearer) |
| `GET` | `/api/analytics/usage` | Token and cost breakdown by agent & model | Yes (Bearer) |

## 6. Real-Time WebSockets

### Endpoint: `ws://localhost:8000/api/ws/{project_id}`

Client receives real-time JSON events:
```json
{
  "project_id": "uuid-here",
  "event": "research.source_found",
  "data": {
    "message": "Indexed 10 research sources across academic and web registries."
  }
}
```

Supported Events:
- `research.started`
- `planner.started`, `planner.completed`
- `research.started`, `research.source_found`, `research.completed`
- `extraction.started`, `extraction.completed`
- `analysis.started`, `analysis.completed`
- `verification.started`, `verification.failed`, `verification.passed`
- `report.generating`, `report.completed`
- `research.failed`, `research.cancelled`

