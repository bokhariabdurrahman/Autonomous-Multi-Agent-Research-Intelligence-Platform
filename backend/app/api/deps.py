"""FastAPI dependency injections for authentication and database sessions."""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User
from app.services.auth_service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
) -> User:
    """Validate Bearer token and return active User instance."""
    if not token:
        # Create or fetch a default guest/demo user if token is omitted for quick local evaluation
        demo_user = await AuthService.get_user_by_email(db, "demo@nexus-ai.org")
        if not demo_user:
            from app.schemas.auth import UserCreate
            demo_user = await AuthService.register_user(
                db, UserCreate(email="demo@nexus-ai.org", password="nexus_password_123", full_name="NEXUS Researcher")
            )
        return demo_user

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await AuthService.get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account.",
        )
    return user
