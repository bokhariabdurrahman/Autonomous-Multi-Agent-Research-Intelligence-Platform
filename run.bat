@echo off
title NEXUS AI - Autonomous Multi-Agent Research & Intelligence Platform
echo ==============================================================================
echo   Starting NEXUS AI: Autonomous Multi-Agent Research & Intelligence Platform
echo ==============================================================================
echo.

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env >nul
)

echo Opening browser at http://localhost:8000 ...
start http://localhost:8000

echo.
echo Starting Server at http://localhost:8000 (Backend API + Frontend UI)...
echo Press Ctrl+C to stop.
echo.
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
