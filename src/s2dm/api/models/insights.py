"""Request model for schema insights endpoints.

Response bodies reuse the result types from `s2dm.tools.insights.models` directly.
"""

from s2dm.api.models.base import SchemasRequest


class InsightsRequest(SchemasRequest):
    """Request model shared by all schema insights endpoints."""
