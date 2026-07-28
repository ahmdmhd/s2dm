"""API configuration constants."""

from pathlib import Path
from typing import Any

from s2dm.api.models.base import ErrorResponse

COMMON_RESPONSES: dict[int | str, dict[str, Any]] = {
    400: {"model": ErrorResponse, "description": "Bad request - invalid or missing fields"},
    422: {"model": ErrorResponse, "description": "Validation failed for the provided schema, query, or config"},
    500: {"model": ErrorResponse, "description": "Internal server error"},
}


def get_api_workspace() -> Path:
    """Return the persistent workspace used by API filesystem operations."""
    return Path.home() / ".s2dm" / "api"
