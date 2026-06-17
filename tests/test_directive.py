from pathlib import Path

from graphql import GraphQLObjectType, build_schema

from s2dm.constants.directive import Directive
from s2dm.exporters.utils.directive import (
    get_field_with_applied_directive,
    get_objects_with_multiple_fields_with_directive,
)
from s2dm.exporters.utils.extraction import get_all_object_types


def test_get_field_with_applied_directive_returns_matching_fields(instance_tag_directive_schema_path: Path) -> None:
    schema = build_schema(instance_tag_directive_schema_path.read_text())
    seat = schema.type_map["Seat"]
    assert isinstance(seat, GraphQLObjectType)
    assert set(get_field_with_applied_directive(seat, Directive.INSTANCE_TAG)) == {"cabinPosition", "fallbackPosition"}


def test_get_objects_with_multiple_fields_with_directive(instance_tag_directive_schema_path: Path) -> None:
    schema = build_schema(instance_tag_directive_schema_path.read_text())
    objects = get_all_object_types(schema)
    result = get_objects_with_multiple_fields_with_directive(objects, Directive.INSTANCE_TAG)
    # Seat declares two @instanceTag fields; Door (one) and CabinPosition (none) are not flagged.
    assert result == {"Seat": ["cabinPosition", "fallbackPosition"]}
