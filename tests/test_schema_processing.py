"""Integration tests for load_and_process_schema."""

import json
from pathlib import Path
from typing import cast

import pytest
from graphql import GraphQLObjectType

from s2dm.exporters.utils.naming_config import CaseFormat
from s2dm.exporters.utils.schema_loader import load_and_process_schema


class TestLoadAndProcessSchema:
    @pytest.fixture
    def expanded_schema_path(self, spec_directory: Path) -> list[Path]:
        return [spec_directory, Path("tests/test_expanded_instances/test_schema.graphql")]

    @pytest.fixture
    def valid_query_path(self, tmp_path: Path) -> Path:
        query_file = tmp_path / "query.graphql"
        query_file.write_text("""
            query {
                vehicle {
                    averageSpeed
                    lowVoltageSystemState
                    adas {
                        abs {
                            isEngaged
                        }
                    }
                }
            }
        """)
        return query_file

    @pytest.fixture
    def naming_config_path(self, tmp_path: Path) -> Path:
        config_file = tmp_path / "naming_config.json"
        config_file.write_text(
            json.dumps(
                {"type": {"object": CaseFormat.MACRO_CASE.value}, "field": {"object": CaseFormat.SNAKE_CASE.value}}
            )
        )
        return config_file

    def test_load_with_selection_query(self, schema_path: list[Path], valid_query_path: Path) -> None:
        annotated_schema, naming_config, query_document = load_and_process_schema(
            schema_path, None, valid_query_path, None, False
        )

        assert query_document is not None
        assert naming_config is None

        assert "Vehicle" in annotated_schema.schema.type_map
        vehicle_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["Vehicle"])
        assert "averageSpeed" in vehicle_type.fields
        assert "lowVoltageSystemState" in vehicle_type.fields
        assert "adas" in vehicle_type.fields

        assert "isAutoPowerOptimize" not in vehicle_type.fields
        assert "body" not in vehicle_type.fields

    def test_load_with_root_type(self, schema_path: list[Path]) -> None:
        annotated_schema, naming_config, query_document = load_and_process_schema(
            schema_path, None, None, "Vehicle", False
        )

        assert query_document is None
        assert naming_config is None
        assert "Vehicle" in annotated_schema.schema.type_map

        assert "Cabin" not in annotated_schema.schema.type_map
        assert "Seat" not in annotated_schema.schema.type_map

    def test_load_with_expanded_instances(self, expanded_schema_path: list[Path]) -> None:
        annotated_schema, naming_config, query_document = load_and_process_schema(
            expanded_schema_path, None, None, None, expanded_instances=True
        )

        assert query_document is None
        assert naming_config is None

        assert "Door_Row" in annotated_schema.schema.type_map
        assert "Door_Side" in annotated_schema.schema.type_map
        assert "Seat_Row" in annotated_schema.schema.type_map
        assert "Seat_Position" in annotated_schema.schema.type_map

        cabin_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["Cabin"])
        assert "Door" in cabin_type.fields
        assert "doors" not in cabin_type.fields
        assert "Seat" in cabin_type.fields
        assert "seats" not in cabin_type.fields

    def test_load_with_expanded_instances_uses_enum_values_without_tag_field_wrapper(
        self, enum_instance_tag_schema_path: Path
    ) -> None:
        annotated_schema, _, _ = load_and_process_schema(
            [enum_instance_tag_schema_path], None, None, None, expanded_instances=True
        )

        vehicle_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["Vehicle"])
        assert "Mirror" in vehicle_type.fields
        assert "mirrors" not in vehicle_type.fields

        mirror_branch_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["Mirror_Position"])
        assert "LEFT" in mirror_branch_type.fields
        assert "CENTER" in mirror_branch_type.fields
        assert "RIGHT" in mirror_branch_type.fields
        assert "position" not in mirror_branch_type.fields

        mirror_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["Mirror"])
        assert "isFolded" in mirror_type.fields
        assert "position" not in mirror_type.fields

        field_meta = annotated_schema.field_metadata[("Vehicle", "Mirror")]
        assert field_meta.resolved_names == ["Mirror.LEFT", "Mirror.CENTER", "Mirror.RIGHT"]

    def test_load_with_expanded_instances_prunes_excluded_instance_tag_combination(self, tmp_path: Path) -> None:
        schema_path = tmp_path / "excluded_instance.graphql"
        schema_path.write_text("""
        directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION

        enum RowEnum { ROW1 ROW2 }
        enum SideEnum { LEFT RIGHT }

        type DoorPosition @instanceTag {
          row: RowEnum!
          side: SideEnum!
        }

        type Door {
          isLocked: Boolean
          doorPosition: DoorPosition @instanceTag(exclude: [\"ROW1.LEFT\"])
        }

        type Cabin {
          doors: [Door]
        }

        type Query {
          cabin: Cabin
        }
        """)

        annotated_schema, _, _ = load_and_process_schema([schema_path], None, None, None, expanded_instances=True)

        field_meta = annotated_schema.field_metadata[("Cabin", "Door")]

        assert field_meta.resolved_names == ["Door.ROW1.RIGHT", "Door.ROW2.LEFT", "Door.ROW2.RIGHT"]

    def test_load_with_expanded_instances_raises_when_exclude_list_matches_nothing(self, tmp_path: Path) -> None:
        schema_path = tmp_path / "invalid_excluded_instance.graphql"
        schema_path.write_text("""
        directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION

        enum RowEnum { ROW1 ROW2 }
        enum SideEnum { LEFT RIGHT }

        type DoorPosition @instanceTag {
          row: RowEnum!
          side: SideEnum!
        }

        type Door {
          doorPosition: DoorPosition @instanceTag(exclude: [\"ROW9.LEFT\"])
        }

        type Cabin {
          doors: [Door]
        }

        type Query {
          cabin: Cabin
        }
        """)

        with pytest.raises(ValueError):
            load_and_process_schema([schema_path], None, None, None, expanded_instances=True)

    def test_load_with_naming_config(self, schema_path: list[Path], naming_config_path: Path) -> None:
        annotated_schema, naming_config, query_document = load_and_process_schema(
            schema_path, naming_config_path, None, None, False
        )

        assert query_document is None
        assert naming_config is not None

        assert "VEHICLE" in annotated_schema.schema.type_map
        vehicle_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["VEHICLE"])
        assert "average_speed" in vehicle_type.fields
        assert "low_voltage_system_state" in vehicle_type.fields
        assert "averageSpeed" not in vehicle_type.fields
        assert "lowVoltageSystemState" not in vehicle_type.fields

    def test_load_with_all_options(
        self,
        schema_path: list[Path],
        naming_config_path: Path,
        tmp_path: Path,
    ) -> None:
        query_file = tmp_path / "query.graphql"
        query_file.write_text("""
            query {
                vehicle {
                    averageSpeed
                    lowVoltageSystemState
                    adas {
                        abs {
                            isEngaged
                        }
                    }
                }
            }
        """)

        annotated_schema, naming_config, query_document = load_and_process_schema(
            schema_path,
            naming_config_path,
            query_file,
            "Vehicle",
            expanded_instances=False,
        )

        assert query_document is not None
        assert naming_config is not None

        assert "VEHICLE" in annotated_schema.schema.type_map
        vehicle_type = cast(GraphQLObjectType, annotated_schema.schema.type_map["VEHICLE"])
        assert "average_speed" in vehicle_type.fields
        assert "low_voltage_system_state" in vehicle_type.fields
        assert "adas" in vehicle_type.fields

        assert "is_auto_power_optimize" not in vehicle_type.fields
        assert "body" not in vehicle_type.fields

        assert "CABIN" not in annotated_schema.schema.type_map
        assert "SEAT" not in annotated_schema.schema.type_map

    def test_load_removes_introspection_types(self, schema_path: list[Path]) -> None:
        annotated_schema, _, _ = load_and_process_schema(schema_path, None, None, None, False)

        assert not any(type_name.startswith("__") for type_name in annotated_schema.schema.type_map)
