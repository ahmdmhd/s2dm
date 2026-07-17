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
