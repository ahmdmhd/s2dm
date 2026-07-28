"""Schema insights service for API endpoints."""

from graphql import GraphQLSchema

from s2dm.api.models.base import SchemaInput
from s2dm.api.services.schema_service import load_validated_schema
from s2dm.tools.insights.concepts import compute_concepts
from s2dm.tools.insights.coverage import compute_coverage
from s2dm.tools.insights.models import ConceptsResult, CoverageResult, QualityResult, RelationshipsResult
from s2dm.tools.insights.quality import compute_quality_issues
from s2dm.tools.insights.relationships import compute_relationships


def _load_schema(schemas: list[SchemaInput]) -> GraphQLSchema:
    annotated_schema, _ = load_validated_schema(
        schemas=schemas,
        naming_config_input=None,
        selection_query_input=None,
        root_type=None,
        expanded_instances=False,
    )
    return annotated_schema.schema


def get_schema_concepts(schemas: list[SchemaInput]) -> ConceptsResult:
    """Get concept counts, member names, and object-type field composition."""
    return compute_concepts(_load_schema(schemas))


def get_schema_relationships(schemas: list[SchemaInput]) -> RelationshipsResult:
    """Get the deepest object-reference paths reachable from the schema's root."""
    return compute_relationships(_load_schema(schemas))


def get_schema_coverage(schemas: list[SchemaInput]) -> CoverageResult:
    """Get documentation coverage across types, fields, enums, and enum values."""
    return compute_coverage(_load_schema(schemas))


def get_schema_quality_issues(schemas: list[SchemaInput]) -> QualityResult:
    """Get quality issues: missing descriptions, deprecated fields, unused elements."""
    return compute_quality_issues(_load_schema(schemas))
