"""Models for schema filter endpoint."""

from s2dm.api.models.base import SchemasWithSelectionQueryRequest


class FilterSchemaRequest(SchemasWithSelectionQueryRequest):
    """Request model for filtering a schema based on selection query."""
