"""Custom application exceptions for NEXUS AI."""

from typing import Any, Optional


class NexusBaseException(Exception):
    """Base exception for NEXUS AI platform."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details


class AuthenticationError(NexusBaseException):
    """Raised when authentication credentials fail validation."""
    pass


class AuthorizationError(NexusBaseException):
    """Raised when user lacks permission for requested resource."""
    pass


class EntityNotFoundError(NexusBaseException):
    """Raised when requested entity is not found in database."""
    pass


class AgentExecutionError(NexusBaseException):
    """Raised when an autonomous agent encounters an unrecoverable failure."""
    pass


class VerificationFailedError(NexusBaseException):
    """Raised when research claims fail rigorous verification threshold."""
    pass


class ExternalAPIError(NexusBaseException):
    """Raised when external research provider (Tavily, Semantic Scholar, etc.) fails."""
    pass


class DocumentProcessingError(NexusBaseException):
    """Raised when parsing or indexing uploaded documents fails."""
    pass

