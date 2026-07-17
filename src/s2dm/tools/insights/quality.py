"""Quality issues: missing descriptions, deprecated fields, and unused enums."""

from graphql import (
    GraphQLEnumType,
    GraphQLField,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLSchema,
    get_named_type,
)

from s2dm.exporters.utils.extraction import get_all_named_types
from s2dm.tools.insights.coverage import compute_coverage
from s2dm.tools.insights.models import QualityIssue, QualityResult


def _unused_enum_names(schema: GraphQLSchema) -> list[str]:
    referenced_type_names: set[str] = set()
    enum_names: set[str] = set()

    for named_type in get_all_named_types(schema):
        if isinstance(named_type, GraphQLEnumType):
            enum_names.add(named_type.name)

        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
            for field_def in named_type.fields.values():
                referenced_type_names.add(get_named_type(field_def.type).name)
                if isinstance(field_def, GraphQLField):
                    for arg in field_def.args.values():
                        referenced_type_names.add(get_named_type(arg.type).name)

    return sorted(enum_names - referenced_type_names)


def compute_quality_issues(schema: GraphQLSchema) -> QualityResult:
    """Flag missing descriptions, deprecated fields, and unused enums."""
    issues: list[QualityIssue] = []

    coverage = compute_coverage(schema)
    for entity in coverage.undocumented:
        issues.append(
            QualityIssue(
                target=entity.name,
                problem="Missing description",
                severity="info",
                category="Missing descriptions",
            ),
        )

    for named_type in get_all_named_types(schema):
        if not isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType):
            continue
        for field_name, field_def in named_type.fields.items():
            if field_def.deprecation_reason is None:
                continue
            issues.append(
                QualityIssue(
                    target=f"{named_type.name}.{field_name}",
                    problem=f"Deprecated: {field_def.deprecation_reason}",
                    severity="warning",
                    category="Deprecated fields",
                ),
            )

    for enum_name in _unused_enum_names(schema):
        issues.append(
            QualityIssue(target=enum_name, problem="Unused enum", severity="warning", category="Unused enums")
        )

    return QualityResult(issues=issues)
