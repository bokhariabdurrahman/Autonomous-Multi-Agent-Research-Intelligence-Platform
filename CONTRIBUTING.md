# Contributing to NEXUS AI

Thank you for your interest in contributing to **NEXUS AI: Autonomous Multi-Agent Research & Intelligence Platform**!

## Development Workflow

1. **Fork and Clone** the repository.
2. **Create a branch**: `git checkout -b feature/your-feature-name`.
3. **Backend setup**:
   - Python 3.11+
   - Create a virtual environment: `python -m venv .venv`
   - Activate: `.\.venv\Scripts\Activate.ps1` (Windows) or `source .venv/bin/activate` (Linux/Mac)
   - Install dependencies: `pip install -r backend/requirements.txt`
4. **Frontend setup**:
   - Node 18+ (tested on Node 20 / 24)
   - `cd frontend && npm install`
   - Run dev server: `npm run dev`
5. **Testing**:
   - Run backend tests: `pytest tests/`
   - Run linting: `ruff check .`
   - Run frontend typecheck: `npm run build`
6. **Submit a Pull Request** with a detailed description of changes and test coverage.

## Code Standards
- Python: PEP 8, Type hints, Pydantic v2 schemas, SQLAlchemy 2.0 async.
- Frontend: TypeScript strict mode, functional components, Tailwind CSS.
- Security: Never commit credentials, sanitize all external untrusted inputs.

