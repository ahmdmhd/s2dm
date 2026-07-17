"""Documentation coverage across types, their fields, enums, enum values, and directives."""

from graphql import (
    GraphQLEnumType,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLNamedType,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLUnionType,
    is_specified_scalar_type,
    specified_directives,
)

from s2dm.exporters.utils.extraction import get_all_named_types
from s2dm.tools.insights.models import CoverageBreakdown, CoverageCount, CoverageResult, UndocumentedEntity


def _type_kind_label(named_type: GraphQLNamedType) -> str:
    if isinstance(named_type, GraphQLObjectType):
        return "Object"
    if isinstance(named_type, GraphQLInterfaceType):
        return "Interface"
    if isinstance(named_type, GraphQLEnumType):
        return "Enum"
    if isinstance(named_type, GraphQLUnionType):
        return "Union"
    if isinstance(named_type, GraphQLScalarType):
        return "Scalar"
    if isinstance(named_type, GraphQLInputObjectType):
        return "Input"
    return "Unknown"


def _has_description(entity: object) -> bool:
    description = getattr(entity, "description", None)
    return bool(description and description.strip())


def compute_coverage(schema: GraphQLSchema) -> CoverageResult:
    """Compute documentation coverage across types, their fields, enums, enum values, and directives."""
    undocumented: list[UndocumentedEntity] = []

    documented_types = 0
    total_types = 0
    documented_fields = 0
    total_fields = 0
    documented_enums = 0
    total_enums = 0
    documented_enum_values = 0
    total_enum_values = 0
    documented_directives = 0
    total_directives = 0

    for named_type in get_all_named_types(schema):
        if isinstance(named_type, GraphQLScalarType) and is_specified_scalar_type(named_type):
            continue

        if isinstance(
            named_type,
            GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType | GraphQLUnionType | GraphQLScalarType,
        ):
            total_types += 1
            if _has_description(named_type):
                documented_types += 1
            else:
                undocumented.append(UndocumentedEntity(name=named_type.name, kind=_type_kind_label(named_type)))

            if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
                for field_name, field_def in named_type.fields.items():
                    total_fields += 1
                    if _has_description(field_def):
                        documented_fields += 1
                    else:
                        undocumented.append(UndocumentedEntity(name=f"{named_type.name}.{field_name}", kind="Field"))

        if isinstance(named_type, GraphQLEnumType):
            total_enums += 1
            if _has_description(named_type):
                documented_enums += 1
            else:
                undocumented.append(UndocumentedEntity(name=named_type.name, kind="Enum"))
            for value_name, enum_value in named_type.values.items():
                total_enum_values += 1
                if _has_description(enum_value):
                    documented_enum_values += 1
                else:
                    undocumented.append(
                        UndocumentedEntity(name=f"{named_type.name}.{value_name}", kind="Enum Value"),
                    )

    for directive in schema.directives:
        if directive in specified_directives:
            continue
        total_directives += 1
        if _has_description(directive):
            documented_directives += 1
        else:
            undocumented.append(UndocumentedEntity(name=f"@{directive.name}", kind="Directive"))

    breakdown = CoverageBreakdown(
        types=CoverageCount(documented=documented_types, total=total_types),
        fields=CoverageCount(documented=documented_fields, total=total_fields),
        enums=CoverageCount(documented=documented_enums, total=total_enums),
        enum_values=CoverageCount(documented=documented_enum_values, total=total_enum_values),
        directives=CoverageCount(documented=documented_directives, total=total_directives),
    )

    return CoverageResult(breakdown=breakdown, undocumented=undocumented)
