"""Authentication and user management service."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationError
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin


class AuthService:
    """Manages user registration, credential validation, and JWT session tokens."""

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Fetch a user record by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Fetch a user record by primary key UUID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @classmethod
    async def register_user(cls, db: AsyncSession, data: UserCreate) -> User:
        """Register a new user account."""
        existing = await cls.get_user_by_email(db, data.email)
        if existing:
            raise AuthenticationError("An account with this email address already exists.")

        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            full_name=data.full_name or data.email.split("@")[0],
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @classmethod
    async def authenticate_user(cls, db: AsyncSession, data: UserLogin) -> dict:
        """Authenticate user credentials and issue access token."""
        user = await cls.get_user_by_email(db, data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationError("User account is inactive.")

        token = create_access_token(subject=user.id)
        return {"access_token": token, "token_type": "bearer", "user": user}

