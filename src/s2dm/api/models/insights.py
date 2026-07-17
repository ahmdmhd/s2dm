"""Request model for schema insights endpoints.

Response bodies reuse the result types from `s2dm.tools.insights.models` directly.
"""

from pydantic import BaseModel, Field

from s2dm.api.models.base import SchemaInput


class InsightsRequest(BaseModel):
    """Request model shared by all schema insights endpoints."""

    schemas: list[SchemaInput] = Field(description="Array of schema inputs (paths or URLs)")
