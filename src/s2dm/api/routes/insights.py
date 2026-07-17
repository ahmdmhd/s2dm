"""Schema insights routes."""

from fastapi import APIRouter

from s2dm.api.config import COMMON_RESPONSES
from s2dm.api.models.insights import InsightsRequest
from s2dm.api.services.insights_service import (
    get_schema_concepts,
    get_schema_coverage,
    get_schema_quality_issues,
    get_schema_relationships,
)
from s2dm.tools.insights.models import ConceptsResult, CoverageResult, QualityResult, RelationshipsResult

router = APIRouter(responses=COMMON_RESPONSES)


@router.post("/concepts", response_model=ConceptsResult)
def get_concepts(request: InsightsRequest) -> ConceptsResult:
    """Get concept counts, member names, and object-type field composition."""
    return get_schema_concepts(request.schemas)


@router.post("/relationships", response_model=RelationshipsResult)
def get_relationships(request: InsightsRequest) -> RelationshipsResult:
    """Get the deepest object-reference paths reachable from the schema's root."""
    return get_schema_relationships(request.schemas)


@router.post("/coverage", response_model=CoverageResult)
def get_coverage(request: InsightsRequest) -> CoverageResult:
    """Get documentation coverage across types, fields, enums, and enum values."""
    return get_schema_coverage(request.schemas)


@router.post("/quality", response_model=QualityResult)
def get_quality(request: InsightsRequest) -> QualityResult:
    """Get quality issues: missing descriptions, deprecated fields, unused enums."""
    return get_schema_quality_issues(request.schemas)
