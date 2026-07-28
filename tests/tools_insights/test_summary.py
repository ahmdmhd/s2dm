from graphql import build_schema

from s2dm.tools.insights.concepts import compute_concepts
from s2dm.tools.insights.coverage import compute_coverage
from s2dm.tools.insights.models import ConceptsResult, CoverageResult, QualityResult, RelationshipsResult
from s2dm.tools.insights.quality import compute_quality_issues
from s2dm.tools.insights.relationships import compute_relationships
from s2dm.tools.insights.summary import (
    build_concepts_summary,
    build_quality_summary,
    build_relationships_summary,
)


def _build_results(schema_sdl: str) -> tuple[ConceptsResult, RelationshipsResult, CoverageResult, QualityResult]:
    schema = build_schema(schema_sdl)
    return (
        compute_concepts(schema),
        compute_relationships(schema),
        compute_coverage(schema),
        compute_quality_issues(schema),
    )


def test_build_concepts_summary(insights_schema_sdl: str) -> None:
    concepts, _, _, quality = _build_results(insights_schema_sdl)

    summary = build_concepts_summary(concepts, quality)

    assert summary == {
        "field_container_types": {
            "total": 4,
            "object_types": 4,
            "interface_types": 0,
            "input_types": 0,
        },
        "fields": {
            "total": 7,
            "leaf_fields": 4,
            "relationship_fields": 3,
        },
        "enums": {
            "total": 2,
            "enum_values": 4,
            "median_values_per_enum": 2.0,
        },
        "scalars": {
            "total": 3,
            "built_in": 2,
            "custom": 1,
        },
        "enum_usage": {
            "used": 1,
            "unused": 1,
            "total": 2,
        },
    }


def test_build_relationships_summary(insights_schema_sdl: str) -> None:
    _, relationships, _, quality = _build_results(insights_schema_sdl)

    summary = build_relationships_summary(relationships, quality)

    assert summary == {
        "references_count": {
            "referenced": 3,
            "total_references": 3,
            "unused": 1,
            "most_referenced": {
                "name": "Seat",
                "count": 1,
            },
            "least_referenced": {
                "name": "Vehicle",
                "count": 1,
            },
            "top_references": [
                {"name": "Seat", "count": 1},
                {"name": "SeatTag", "count": 1},
                {"name": "Vehicle", "count": 1},
            ],
        },
        "deepest_nested_paths": {
            "max_depth": 2,
            "paths_with_max_depth_count": 1,
            "total_paths": 1,
            "depth_distribution": [
                {"depth": 2, "path_count": 1},
            ],
            "deepest_path_example": {
                "depth": 2,
                "path": ["Vehicle", "seat: Seat", "tag: SeatTag"],
            },
        },
        "cyclic_references": {
            "count": 0,
            "shortest_length": 0,
            "cycle_length_distribution": [],
            "shortest_cycle_example": None,
        },
    }

def test_build_quality_summary(insights_schema_sdl: str) -> None:
    concepts, _, coverage, quality = _build_results(insights_schema_sdl)

    summary = build_quality_summary(coverage, quality, concepts)

    assert summary == {
        "coverage": {
            "types": {
                "total": 5,
                "documented": 1,
                "undocumented": 4,
                "percentage": 20,
            },
            "fields": {
                "total": 7,
                "documented": 2,
                "undocumented": 5,
                "percentage": 29,
            },
            "enums": {
                "total": 2,
                "documented": 1,
                "undocumented": 1,
                "percentage": 50,
            },
            "enum_values": {
                "total": 4,
                "documented": 0,
                "undocumented": 4,
                "percentage": 0,
            },
            "directives": {
                "total": 2,
                "documented": 0,
                "undocumented": 2,
                "percentage": 0,
            },
        },
        "unused_elements": {
            "total": 9,
            "used": 7,
            "unused": 2,
            "percentage": 22,
            "categories": {
                "types": {
                    "total": 5,
                    "used": 5,
                    "unused": 0,
                    "percentage": 0,
                },
                "enums": {
                    "total": 2,
                    "used": 1,
                    "unused": 1,
                    "percentage": 50,
                },
                "directives": {
                    "total": 2,
                    "used": 1,
                    "unused": 1,
                    "percentage": 50,
                },
            },
        },
        "missing_units": {
            "count": 2,
        },
    }
