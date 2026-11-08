"""WebSocket connection manager for real-time agent event streaming."""

import json
from typing import Dict, List, Set
from fastapi import WebSocket
from app.monitoring.logger import logger


class ConnectionManager:
    """Manages active WebSocket connections grouped by research project ID."""

    def __init__(self):
        # Maps project_id -> set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        """Accept and register a new client connection for a specific project."""
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = set()
        self.active_connections[project_id].add(websocket)
        logger.info(f"WebSocket client connected to project {project_id}. Total: {len(self.active_connections[project_id])}")

    def disconnect(self, websocket: WebSocket, project_id: str):
        """Unregister a client connection."""
        if project_id in self.active_connections:
            self.active_connections[project_id].discard(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        logger.info(f"WebSocket client disconnected from project {project_id}.")

    async def broadcast_event(self, project_id: str, event_type: str, data: dict):
        """Broadcast a structured agent event to all connected clients on this project."""
        if project_id not in self.active_connections:
            return

        message = {
            "project_id": project_id,
            "event": event_type,
            "data": data,
        }
        raw_json = json.dumps(message)
        dead_sockets = set()

        for connection in self.active_connections[project_id]:
            try:
                await connection.send_text(raw_json)
            except Exception as e:
                logger.warning(f"Error sending WebSocket event to client: {e}")
                dead_sockets.add(connection)

        for dead in dead_sockets:
            self.disconnect(dead, project_id)


ws_manager = ConnectionManager()

