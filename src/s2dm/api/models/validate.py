"""Models for schema validate endpoint."""

from s2dm.api.models.base import SchemasRequest


class ValidateSchemaRequest(SchemasRequest):
    """Request model for composing and validating schemas."""
