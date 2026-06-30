from collections.abc import Callable, Iterator
from typing import TypeVar, overload

from graphql import (
    DocumentNode,
    FieldNode,
    GraphQLNamedType,
    GraphQLObjectType,
    GraphQLSchema,
    OperationDefinitionNode,
    OperationType,
    get_named_type,
    is_interface_type,
    is_object_type,
)

from s2dm.exporters.utils.directive import has_given_directive
from s2dm.exporters.utils.graphql_type import is_introspection_type

_T = TypeVar("_T", bound=GraphQLNamedType)
_R = TypeVar("_R")


@overload
def select_types(
    schema: GraphQLSchema, include_kind: type[_T], /, *, exclude_by_name: Callable[[str], bool]
) -> Iterator[tuple[str, _T]]: ...


@overload
def select_types(
    schema: GraphQLSchema, *include_kinds: type[GraphQLNamedType], exclude_by_name: Callable[[str], bool]
) -> Iterator[tuple[str, GraphQLNamedType]]: ...


def select_types(
    schema: GraphQLSchema,
    *include_kinds: type[GraphQLNamedType],
    exclude_by_name: Callable[[str], bool],
) -> Iterator[tuple[str, GraphQLNamedType]]:
    """Yield ``(name, type)`` pairs from the schema's type map.

    Args:
        schema: The GraphQL schema to iterate.
        include_kinds: When given, only types that are instances of one of these classes are yielded.
        exclude_by_name: Predicate on the type name; matching types are excluded.
    """
    for type_name, type_object in schema.type_map.items():
        if exclude_by_name(type_name):
            continue
        if include_kinds and not isinstance(type_object, include_kinds):
            continue
        yield type_name, type_object


def map_types(
    selected: Iterator[tuple[str, _T]],
    transform: Callable[[str, _T], _R],
) -> Iterator[_R]:
    """Apply ``transform`` to each ``(name, type)`` pair yielded by :func:`select_types`.

    Args:
        selected: ``(name, type)`` pairs, typically from :func:`select_types`.
        transform: Maps a name and its type to the value the caller wants.
    """
    return (transform(name, type_) for name, type_ in selected)


def get_all_named_types(schema: GraphQLSchema) -> list[GraphQLNamedType]:
    """
    Extracts all named types (ScalarType, ObjectType, InterfaceType, UnionType, EnumType, and InputObjectType)
    from the provided GraphQL schema.

    Args:
        schema (GraphQLSchema): The GraphQL schema to extract named types from.
    Returns:
        list[GraphQLNamedType]: A list of all named types in the schema.
    """
    selected = select_types(schema, GraphQLNamedType, exclude_by_name=is_introspection_type)
    named_types = map_types(selected, lambda _, type_: type_)
    return list(named_types)


def get_all_object_types(
    schema: GraphQLSchema,
) -> list[GraphQLObjectType]:
    """
    Extracts all object types from the provided GraphQL schema.
    Args:
        schema (GraphQLSchema): The GraphQL schema to extract object types from.
    Returns:
        list[GraphQLObjectType]: A list of all object types in the schema.
    """
    selected = select_types(schema, GraphQLObjectType, exclude_by_name=is_introspection_type)
    object_types = map_types(selected, lambda _, type_: type_)
    return list(object_types)


def get_all_objects_with_directive(objects: list[GraphQLObjectType], directive_name: str) -> list[GraphQLObjectType]:
    # TODO: Extend this function to return all objects that have any directive is directive_name is None
    return [o for o in objects if has_given_directive(o, directive_name)]


def get_root_level_types_from_query(schema: GraphQLSchema, selection_query: DocumentNode | None) -> list[str]:
    """Extract root-level type names from the selection query.

    Args:
        schema: The GraphQL schema
        selection_query: The selection query document

    Returns:
        List of type names that are selected at the root level of the query
    """
    query_type = schema.query_type
    if not selection_query or not query_type:
        return []

    root_type_names: list[str] = []

    for definition in selection_query.definitions:
        if not isinstance(definition, OperationDefinitionNode) or definition.operation != OperationType.QUERY:
            continue

        for selection in definition.selection_set.selections:
            if not isinstance(selection, FieldNode):
                continue

            field_name = selection.name.value
            if field_name not in query_type.fields:
                continue

            field = query_type.fields[field_name]
            field_type = get_named_type(field.type)

            if is_object_type(field_type) or is_interface_type(field_type):
                root_type_names.append(field_type.name)

    return root_type_names


def get_query_operation_name(selection_query: DocumentNode, default_name: str) -> str:
    """
    Extract the operation name from a selection query document.

    Args:
        selection_query: The GraphQL selection query document
        default_name: Default name to use if no operation name is found

    Returns:
        str: The operation name from the query, or default_name if not found
    """
    for definition in selection_query.definitions:
        if not isinstance(definition, OperationDefinitionNode) or definition.operation != OperationType.QUERY:
            continue

        if definition.name:
            return definition.name.value
        return default_name

    return default_name
