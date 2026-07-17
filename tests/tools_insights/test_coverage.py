from graphql import build_schema

from s2dm.tools.insights.coverage import compute_coverage


def test_fully_documented_schema_has_full_coverage() -> None:
    sdl = '''
    """A vehicle."""
    type Vehicle {
      """Vehicle identifier."""
      id: ID!
    }

    """Vehicle power status."""
    enum StatusEnum {
      """Powered on."""
      ON
      """Powered off."""
      OFF
    }

    """Root query type."""
    type Query {
      """The vehicle."""
      vehicle: Vehicle
    }
    '''
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    breakdown = coverage.breakdown
    assert breakdown.types.documented == breakdown.types.total
    assert breakdown.fields.documented == breakdown.fields.total
    assert breakdown.enums.documented == breakdown.enums.total
    assert breakdown.enum_values.documented == breakdown.enum_values.total
    assert coverage.undocumented == []


def test_undocumented_entities_are_listed_by_kind() -> None:
    sdl = """
    type Vehicle {
      id: ID!
    }

    enum StatusEnum { ON OFF }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    undocumented_by_name = {entity.name: entity.kind for entity in coverage.undocumented}
    assert undocumented_by_name["Vehicle"] == "Object"
    assert undocumented_by_name["Vehicle.id"] == "Field"
    assert undocumented_by_name["StatusEnum"] == "Enum"
    assert undocumented_by_name["StatusEnum.ON"] == "Enum Value"


def test_breakdown_counts_include_interface_and_input_fields() -> None:
    sdl = """
    interface Identifiable {
      id: ID
    }

    input VehicleFilter {
      id: ID
    }

    type Query {
      value: String
    }
    """
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    container_names = {entity.name for entity in coverage.undocumented if entity.kind in {"Interface", "Input"}}
    assert {"Identifiable", "VehicleFilter"} <= container_names
    assert coverage.breakdown.fields.total >= 3


def test_breakdown_with_no_enums_has_zero_totals() -> None:
    sdl = """
    type Query {
      value: Int
    }
    """
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    assert coverage.breakdown.enums.total == 0
    assert coverage.breakdown.enum_values.total == 0


def test_union_and_custom_scalar_increase_type_coverage_total() -> None:
    sdl = """
    type Vehicle {
      id: ID!
    }

    type Cabin {
      id: ID!
    }

    union SearchResult = Vehicle | Cabin

    scalar DateTime

    type Query {
      value: DateTime
    }
    """
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    type_names = {entity.name for entity in coverage.undocumented if entity.kind in {"Union", "Scalar"}}
    assert type_names == {"SearchResult", "DateTime"}
    assert coverage.breakdown.types.total == 5


def test_undocumented_custom_scalar_reduces_type_coverage() -> None:
    sdl = '''
    """An ISO-8601 timestamp."""
    scalar DateTime

    scalar RawJson

    """Root query type."""
    type Query {
      """When the record was created."""
      created: DateTime
      """Arbitrary payload."""
      payload: RawJson
    }
    '''
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    assert coverage.breakdown.types.documented < coverage.breakdown.types.total
    assert any(entity.name == "RawJson" and entity.kind == "Scalar" for entity in coverage.undocumented)


def test_documented_custom_directive_counts_toward_directive_coverage() -> None:
    sdl = '''
    """Marks a field as an instance tag."""
    directive @instanceTag on FIELD_DEFINITION

    type Query {
      value: String
    }
    '''
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    assert coverage.breakdown.directives.total == 1
    assert coverage.breakdown.directives.documented == 1


def test_undocumented_custom_directive_is_listed() -> None:
    sdl = """
    directive @internal on FIELD_DEFINITION

    type Query {
      value: String
    }
    """
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    assert coverage.breakdown.directives.total == 1
    assert coverage.breakdown.directives.documented == 0
    assert any(entity.name == "@internal" and entity.kind == "Directive" for entity in coverage.undocumented)


def test_builtin_directives_are_excluded_from_directive_coverage() -> None:
    sdl = """
    type Query {
      value: String @deprecated(reason: "no longer used")
    }
    """
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    assert coverage.breakdown.directives.total == 0
    assert not any(entity.kind == "Directive" for entity in coverage.undocumented)


def test_builtin_scalars_are_excluded_from_type_coverage() -> None:
    sdl = '''
    """A vehicle."""
    type Vehicle {
      """Vehicle identifier."""
      id: ID!
      """Vehicle speed."""
      speed: Float
    }

    """Root query type."""
    type Query {
      """The vehicle."""
      vehicle: Vehicle
    }
    '''
    schema = build_schema(sdl)

    coverage = compute_coverage(schema)

    builtin_scalar_names = {"ID", "Float", "String", "Int", "Boolean"}
    undocumented_names = {entity.name for entity in coverage.undocumented}
    assert not builtin_scalar_names & undocumented_names
    assert coverage.breakdown.types.total == 2
