"""Unit tests for security, password hashing, and JWT tokens."""

import pytest
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing():
    raw = "nexus_secret_pass_2026"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong_password", hashed) is False


def test_jwt_token_creation_and_decoding():
    subject = "user-12345-uuid"
    token = create_access_token(subject=subject)
    assert isinstance(token, str)
    assert len(token) > 20

    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == subject
    assert "exp" in payload


def test_jwt_invalid_token():
    invalid_token = "invalid.token.payload"
    payload = decode_access_token(invalid_token)
    assert payload is None

