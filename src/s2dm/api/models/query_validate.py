"""Models for query validate endpoint."""

from s2dm.api.models.base import SchemasWithSelectionQueryRequest


class ValidateQueryRequest(SchemasWithSelectionQueryRequest):
    """Request model for validating a GraphQL query against a schema."""
