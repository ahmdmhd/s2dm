"""Quality issues: missing descriptions, deprecated fields, and unused elements."""

from typing import Any

from graphql import (
    GraphQLEnumType,
    GraphQLField,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLNamedType,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLUnionType,
    get_named_type,
    specified_directives,
)

from s2dm.exporters.utils.extraction import get_all_named_types
from s2dm.exporters.utils.graphql_type import is_builtin_scalar_type
from s2dm.tools.insights.coverage import compute_coverage
from s2dm.tools.insights.models import QualityIssue, QualityResult

# Each unused element kind maps to its per-element problem message and its grouping category.
_UNUSED_KINDS: list[tuple[type[GraphQLNamedType], str, str]] = [
    (GraphQLObjectType, "Unused object type", "Unused object types"),
    (GraphQLInterfaceType, "Unused interface", "Unused interfaces"),
    (GraphQLUnionType, "Unused union", "Unused unions"),
    (GraphQLEnumType, "Unused enum", "Unused enums"),
    (GraphQLInputObjectType, "Unused input type", "Unused input types"),
    (GraphQLScalarType, "Unused scalar", "Unused scalars"),
]


def _unused_kind(named_type: GraphQLNamedType) -> tuple[str, str] | None:
    for type_class, problem, category in _UNUSED_KINDS:
        if isinstance(named_type, type_class):
            return problem, category
    return None


def _referenced_type_names(schema: GraphQLSchema) -> set[str]:
    """Collect every type name reachable through fields, field/directive arguments, unions, interfaces, and roots."""
    referenced: set[str] = set()
    implementers: dict[str, list[str]] = {}

    for named_type in get_all_named_types(schema):
        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
            for field_def in named_type.fields.values():
                field_type = get_named_type(field_def.type)
                referenced.add(field_type.name)
                if isinstance(field_def, GraphQLField):
                    for arg in field_def.args.values():
                        arg_type = get_named_type(arg.type)
                        referenced.add(arg_type.name)

        if isinstance(named_type, GraphQLUnionType):
            for member in named_type.types:
                referenced.add(member.name)

        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType):
            for interface in named_type.interfaces:
                implementers.setdefault(interface.name, []).append(named_type.name)

    for directive in schema.directives:
        for arg in directive.args.values():
            arg_type = get_named_type(arg.type)
            referenced.add(arg_type.name)

    for root in (schema.query_type, schema.mutation_type, schema.subscription_type):
        if root is not None:
            referenced.add(root.name)

    # A referenced interface keeps its implementers reachable, since a field returning the
    # interface can resolve to any of them.
    pending = list(referenced)
    while pending:
        name = pending.pop()
        for implementer in implementers.get(name, []):
            if implementer not in referenced:
                referenced.add(implementer)
                pending.append(implementer)

    return referenced


def _unused_issues(schema: GraphQLSchema) -> list[QualityIssue]:
    referenced = _referenced_type_names(schema)
    issues: list[QualityIssue] = []

    for named_type in get_all_named_types(schema):
        kind = _unused_kind(named_type)
        if kind is None:
            continue
        if isinstance(named_type, GraphQLScalarType) and is_builtin_scalar_type(named_type.name):
            continue
        if named_type.name in referenced:
            continue
        problem, category = kind
        issues.append(QualityIssue(target=named_type.name, problem=problem, severity="warning", category=category))

    return issues


# Scalars whose fields carry no physical quantity, so a unit would be meaningless.
_UNITLESS_SCALAR_NAMES = {"String", "ID", "Boolean"}


def _missing_unit_issues(schema: GraphQLSchema) -> list[QualityIssue]:
    """Flag scalar-typed fields that declare no ``unit`` argument.

    This is a sanity check, not a modeling requirement: a field measuring a physical
    quantity usually names its unit, so a missing one is worth a glance. Fields typed by
    String, ID, or Boolean carry no quantity and are skipped.
    """
    issues: list[QualityIssue] = []

    for named_type in get_all_named_types(schema):
        if not isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType):
            continue
        for field_name, field_def in named_type.fields.items():
            output_type = get_named_type(field_def.type)
            if not isinstance(output_type, GraphQLScalarType):
                continue
            if output_type.name in _UNITLESS_SCALAR_NAMES:
                continue
            if "unit" in field_def.args:
                continue
            issues.append(
                QualityIssue(
                    target=f"{named_type.name}.{field_name}",
                    problem="Missing unit",
                    severity="info",
                    category="Missing units",
                ),
            )

    return issues


def _directive_names(node: Any) -> set[str]:
    """Names of the directives applied on a single AST node."""
    if node is None:
        return set()
    return {directive.name.value for directive in getattr(node, "directives", None) or ()}


def _applied_directive_names(schema: GraphQLSchema) -> set[str]:
    """Collect the names of every directive applied anywhere in the schema."""
    applied: set[str] = _directive_names(schema.ast_node)
    for schema_extension in schema.extension_ast_nodes:
        applied |= _directive_names(schema_extension)

    for named_type in get_all_named_types(schema):
        applied |= _directive_names(named_type.ast_node)
        for type_extension in named_type.extension_ast_nodes:
            applied |= _directive_names(type_extension)

        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
            for field_def in named_type.fields.values():
                applied |= _directive_names(field_def.ast_node)
                if isinstance(field_def, GraphQLField):
                    for arg in field_def.args.values():
                        applied |= _directive_names(arg.ast_node)

        if isinstance(named_type, GraphQLEnumType):
            for enum_value in named_type.values.values():
                applied |= _directive_names(enum_value.ast_node)

    return applied


def _unused_directive_issues(schema: GraphQLSchema) -> list[QualityIssue]:
    applied = _applied_directive_names(schema)
    issues: list[QualityIssue] = []

    for directive in schema.directives:
        if directive in specified_directives:
            continue
        if directive.name in applied:
            continue
        issues.append(
            QualityIssue(
                target=f"@{directive.name}",
                problem="Unused directive",
                severity="warning",
                category="Unused directives",
            )
        )

    return issues


def compute_quality_issues(schema: GraphQLSchema) -> QualityResult:
    """Flag missing descriptions, deprecated fields, and unused elements."""
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

    issues.extend(_unused_issues(schema))
    issues.extend(_unused_directive_issues(schema))
    issues.extend(_missing_unit_issues(schema))

    return QualityResult(issues=issues)
