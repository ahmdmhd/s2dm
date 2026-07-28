import json
from pathlib import Path
from typing import cast

import pytest
from click.testing import CliRunner

from s2dm.cli import cli


@pytest.fixture(scope="module")
def runner() -> CliRunner:
    return CliRunner()


def _parse_json_payload(output: str) -> dict[str, object]:
    return cast(dict[str, object], json.loads(output[output.index("{") :]))


@pytest.mark.parametrize(
    ("subcommand", "expected_keys"),
    [
        ("concepts", {"field_container_types", "fields", "enums", "scalars", "enum_usage"}),
        ("relationships", {"references_count", "deepest_nested_paths", "cyclic_references"}),
        ("quality", {"coverage", "unused_elements", "missing_units"}),
    ],
)
def test_insights_commands_print_summary_json(
    runner: CliRunner,
    insights_schema_path: Path,
    subcommand: str,
    expected_keys: set[str],
) -> None:
    result = runner.invoke(cli, ["insights", subcommand, "-s", str(insights_schema_path)])

    assert result.exit_code == 0, result.output

    payload = _parse_json_payload(result.output)
    assert set(payload) == expected_keys


def test_insights_quality_matches_summary_shape(runner: CliRunner, insights_schema_path: Path) -> None:
    result = runner.invoke(cli, ["insights", "quality", "-s", str(insights_schema_path)])

    assert result.exit_code == 0, result.output

    payload = _parse_json_payload(result.output)
    assert payload == {
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


def test_insights_concepts_matches_summary_shape(runner: CliRunner, insights_schema_path: Path) -> None:
    result = runner.invoke(cli, ["insights", "concepts", "-s", str(insights_schema_path)])

    assert result.exit_code == 0, result.output

    payload = _parse_json_payload(result.output)
    assert payload == {
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


def test_insights_relationships_matches_summary_shape(runner: CliRunner, insights_schema_path: Path) -> None:
    result = runner.invoke(cli, ["insights", "relationships", "-s", str(insights_schema_path)])

    assert result.exit_code == 0, result.output

    payload = _parse_json_payload(result.output)
    assert payload == {
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
