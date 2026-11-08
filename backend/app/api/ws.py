"""WebSocket endpoint for real-time agent event streaming."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.monitoring.logger import logger
from app.services.ws_manager import ws_manager

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/{project_id}")
async def websocket_research_feed(websocket: WebSocket, project_id: str):
    """Real-time bi-directional telemetry stream for an active research project."""
    await ws_manager.connect(websocket, project_id)
    try:
        while True:
            # Keep socket alive and accept ping/heartbeat messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, project_id)
    except Exception as e:
        logger.warning(f"WebSocket connection error on project {project_id}: {e}")
        ws_manager.disconnect(websocket, project_id)

