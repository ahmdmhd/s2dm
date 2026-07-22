from graphql import build_schema

from s2dm.tools.insights.quality import compute_quality_issues


def test_missing_description_is_flagged_as_info() -> None:
    sdl = """
    type Vehicle {
      id: ID!
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    vehicle_issue = next(issue for issue in quality.issues if issue.target == "Vehicle")
    assert vehicle_issue.severity == "info"
    assert vehicle_issue.category == "Missing descriptions"


def test_deprecated_field_is_flagged_as_warning() -> None:
    sdl = """
    type Vehicle {
      id: ID!
      oldSpeed: Int @deprecated(reason: "use speed")
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    deprecated_issue = next(issue for issue in quality.issues if issue.category == "Deprecated fields")
    assert deprecated_issue.target == "Vehicle.oldSpeed"
    assert deprecated_issue.severity == "warning"
    assert "use speed" in deprecated_issue.problem


def test_enum_unreferenced_by_any_field_or_argument_is_flagged_unused() -> None:
    sdl = """
    type Vehicle {
      status(filter: UsedEnum): UsedEnum
    }

    enum UsedEnum { ON OFF }
    enum UnusedEnum { A B }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_targets = {issue.target for issue in quality.issues if issue.category == "Unused enums"}
    assert unused_targets == {"UnusedEnum"}


def test_enum_referenced_only_as_argument_is_not_unused() -> None:
    sdl = """
    type Vehicle {
      status(filter: FilterEnum): String
    }

    enum FilterEnum { A B }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_targets = {issue.target for issue in quality.issues if issue.category == "Unused enums"}
    assert unused_targets == set()


def test_unused_element_kinds_are_flagged_by_category() -> None:
    sdl = """
    type Vehicle {
      id: ID!
    }

    type Orphan {
      id: ID!
    }

    interface OrphanInterface {
      id: ID!
    }

    union OrphanUnion = Vehicle

    input OrphanInput {
      id: ID!
    }

    scalar OrphanScalar

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    targets_by_category = {
        category: {issue.target for issue in quality.issues if issue.category == category}
        for category in {issue.category for issue in quality.issues}
    }
    assert "Orphan" in targets_by_category["Unused object types"]
    assert targets_by_category["Unused interfaces"] == {"OrphanInterface"}
    assert targets_by_category["Unused unions"] == {"OrphanUnion"}
    assert targets_by_category["Unused input types"] == {"OrphanInput"}
    assert targets_by_category["Unused scalars"] == {"OrphanScalar"}


def test_root_and_referenced_object_types_are_not_unused() -> None:
    sdl = """
    type Vehicle {
      id: ID!
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_objects = {issue.target for issue in quality.issues if issue.category == "Unused object types"}
    assert unused_objects == set()


def test_implementer_of_referenced_interface_is_not_unused() -> None:
    sdl = """
    interface Node {
      id: ID!
    }

    type Vehicle implements Node {
      id: ID!
    }

    type Query {
      node: Node
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_objects = {issue.target for issue in quality.issues if issue.category == "Unused object types"}
    assert unused_objects == set()


def test_enum_referenced_only_as_directive_argument_is_not_unused() -> None:
    sdl = """
    directive @filter(by: FilterEnum) on FIELD_DEFINITION

    enum FilterEnum { A B }

    type Vehicle {
      id: ID!
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_targets = {issue.target for issue in quality.issues if issue.category == "Unused enums"}
    assert unused_targets == set()


def test_directive_never_applied_is_flagged_unused() -> None:
    sdl = """
    directive @audit on OBJECT

    type Vehicle {
      id: ID!
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_targets = {issue.target for issue in quality.issues if issue.category == "Unused directives"}
    assert unused_targets == {"@audit"}


def test_applied_directive_is_not_flagged_unused() -> None:
    sdl = """
    directive @audit on OBJECT
    directive @internal on FIELD_DEFINITION

    type Vehicle @audit {
      id: ID! @internal
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_targets = {issue.target for issue in quality.issues if issue.category == "Unused directives"}
    assert unused_targets == set()


def test_builtin_directives_are_not_flagged_unused() -> None:
    sdl = """
    type Vehicle {
      id: ID!
      oldSpeed: Int @deprecated(reason: "use speed")
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_targets = {issue.target for issue in quality.issues if issue.category == "Unused directives"}
    assert unused_targets == set()


def test_builtin_scalars_are_not_flagged_unused() -> None:
    sdl = """
    type Vehicle {
      id: ID!
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    unused_scalars = {issue.target for issue in quality.issues if issue.category == "Unused scalars"}
    assert unused_scalars == set()


def test_scalar_field_without_unit_argument_is_flagged_missing_unit() -> None:
    sdl = """
    scalar UInt16

    type Vehicle {
      height: UInt16
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    missing_unit = next(issue for issue in quality.issues if issue.category == "Missing units")
    assert missing_unit.target == "Vehicle.height"
    assert missing_unit.severity == "info"


def test_scalar_field_with_unit_argument_is_not_flagged() -> None:
    sdl = """
    scalar UInt16

    enum LengthUnit { MILLIM CENTIM }

    type Vehicle {
      height(unit: LengthUnit = MILLIM): UInt16
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    missing_unit_targets = {issue.target for issue in quality.issues if issue.category == "Missing units"}
    assert missing_unit_targets == set()


def test_string_boolean_and_id_fields_are_not_missing_unit_candidates() -> None:
    sdl = """
    type Vehicle {
      id: ID!
      name: String
      locked: Boolean
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    missing_unit_targets = {issue.target for issue in quality.issues if issue.category == "Missing units"}
    assert missing_unit_targets == set()


def test_object_typed_field_is_not_a_missing_unit_candidate() -> None:
    sdl = """
    type Cabin {
      id: ID!
    }

    type Vehicle {
      cabin: Cabin
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    missing_unit_targets = {issue.target for issue in quality.issues if issue.category == "Missing units"}
    assert missing_unit_targets == set()


def test_list_of_scalar_field_without_unit_is_flagged() -> None:
    sdl = """
    scalar UInt16

    type Vehicle {
      samples: [UInt16!]
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    quality = compute_quality_issues(schema)

    missing_unit_targets = {issue.target for issue in quality.issues if issue.category == "Missing units"}
    assert missing_unit_targets == {"Vehicle.samples"}
