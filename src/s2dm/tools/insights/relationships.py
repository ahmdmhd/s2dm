"""Deepest object-reference paths reachable from the schema's root."""

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
from s2dm.exporters.utils.graphql_type import is_builtin_scalar_type, is_root_type
from s2dm.tools.insights.models import (
    CyclicReference,
    DepthCount,
    ReferenceCount,
    RelationshipPath,
    RelationshipsResult,
)


def _object_reference_graph(schema: GraphQLSchema) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = {}
    for named_type in get_all_named_types(schema):
        if not isinstance(named_type, GraphQLObjectType) or is_root_type(named_type.name):
            continue
        referenced_type_names = []
        for field_def in named_type.fields.values():
            field_type = get_named_type(field_def.type)
            if isinstance(field_type, GraphQLObjectType) and not is_root_type(field_type.name):
                referenced_type_names.append(field_type.name)
        graph[named_type.name] = referenced_type_names
    return graph


def _unreferenced_object_type_names(graph: dict[str, list[str]]) -> list[str]:
    referenced_type_names = {name for names in graph.values() for name in names}
    return [name for name in graph if name not in referenced_type_names]


def _root_object_type_names(schema: GraphQLSchema, graph: dict[str, list[str]]) -> list[str]:
    query_type = schema.query_type
    root_type_names = []
    if query_type is not None:
        for field_def in query_type.fields.values():
            field_type = get_named_type(field_def.type)
            if isinstance(field_type, GraphQLObjectType) and field_type.name in graph:
                root_type_names.append(field_type.name)

    if root_type_names:
        return root_type_names

    return _unreferenced_object_type_names(graph)


def _find_all_paths(graph: dict[str, list[str]], root_type_names: list[str]) -> list[list[str]]:
    paths: list[list[str]] = []

    def walk(node: str, visited: set[str], path: list[str]) -> None:
        path.append(node)
        visited.add(node)

        neighbors = graph.get(node, [])
        has_self_reference = node in neighbors
        unvisited_neighbors = [neighbor for neighbor in neighbors if neighbor != node and neighbor not in visited]

        if has_self_reference:
            paths.append([*path, node])
        if not unvisited_neighbors and not has_self_reference:
            paths.append(list(path))
        for neighbor in unvisited_neighbors:
            walk(neighbor, visited, path)

        path.pop()
        visited.discard(node)

    for root_type_name in root_type_names:
        walk(root_type_name, set(), [])

    return paths


def _canonical_cycle(cycle_nodes: list[str]) -> tuple[str, ...]:
    """Rotate a loop's node list so it starts at its lexicographically smallest type."""
    start_index = cycle_nodes.index(min(cycle_nodes))
    rotated = cycle_nodes[start_index:] + cycle_nodes[:start_index]
    return tuple(rotated)


def _find_cyclic_references(graph: dict[str, list[str]], root_type_names: list[str]) -> list[CyclicReference]:
    canonical_cycles: set[tuple[str, ...]] = set()

    def walk(node: str, path: list[str], on_path: set[str]) -> None:
        path.append(node)
        on_path.add(node)

        for neighbor in graph.get(node, []):
            if neighbor in on_path:
                cycle_start_index = path.index(neighbor)
                cycle_nodes = path[cycle_start_index:]
                canonical_cycles.add(_canonical_cycle(cycle_nodes))
            else:
                walk(neighbor, path, on_path)

        path.pop()
        on_path.discard(node)

    for root_type_name in root_type_names:
        walk(root_type_name, [], set())

    cyclic_references = []
    for canonical in canonical_cycles:
        segments = [*canonical, canonical[0]]
        cyclic_references.append(CyclicReference(segments=segments, length=len(segments) - 1))
    cyclic_references.sort(key=lambda cycle: (cycle.length, cycle.segments))
    return cyclic_references


def _depth_distribution(paths: list[list[str]]) -> list[DepthCount]:
    counts_by_depth: dict[int, int] = {}
    for path in paths:
        depth = len(path) - 1
        counts_by_depth[depth] = counts_by_depth.get(depth, 0) + 1
    return [DepthCount(depth=depth, count=counts_by_depth[depth]) for depth in sorted(counts_by_depth)]


def _is_countable_type(named_type: GraphQLNamedType) -> bool:
    """A schema-defined type eligible for reference counting.

    Excludes roots and built-in scalars. Also excludes enums, which have their own Enum Usage card.
    """
    if is_root_type(named_type.name):
        return False
    if isinstance(named_type, GraphQLScalarType) and is_builtin_scalar_type(named_type.name):
        return False
    return isinstance(
        named_type,
        GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLInputObjectType | GraphQLScalarType,
    )


def _type_reference_counts(schema: GraphQLSchema) -> dict[str, int]:
    """Count how many times each type is referenced by fields, arguments, unions, and interfaces."""
    counts: dict[str, int] = {}

    def bump(name: str) -> None:
        counts[name] = counts.get(name, 0) + 1

    for named_type in get_all_named_types(schema):
        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
            for field_def in named_type.fields.values():
                bump(get_named_type(field_def.type).name)
                if isinstance(field_def, GraphQLField):
                    for arg in field_def.args.values():
                        bump(get_named_type(arg.type).name)

        if isinstance(named_type, GraphQLUnionType):
            for member in named_type.types:
                bump(member.name)

        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType):
            for interface in named_type.interfaces:
                bump(interface.name)

    for directive in schema.directives:
        for arg in directive.args.values():
            bump(get_named_type(arg.type).name)

    return counts


def _applied_directive_names(node: Any) -> list[str]:
    """Names of the directives applied on a single AST node, including repeats."""
    if node is None:
        return []
    return [directive.name.value for directive in getattr(node, "directives", None) or ()]


def _directive_application_counts(schema: GraphQLSchema) -> dict[str, int]:
    """Count how many times each directive is applied across the schema."""
    counts: dict[str, int] = {}

    def bump_all(node: Any) -> None:
        for name in _applied_directive_names(node):
            counts[name] = counts.get(name, 0) + 1

    bump_all(schema.ast_node)
    for schema_extension in schema.extension_ast_nodes:
        bump_all(schema_extension)

    for named_type in get_all_named_types(schema):
        bump_all(named_type.ast_node)
        for type_extension in named_type.extension_ast_nodes:
            bump_all(type_extension)

        if isinstance(named_type, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
            for field_def in named_type.fields.values():
                bump_all(field_def.ast_node)
                if isinstance(field_def, GraphQLField):
                    for arg in field_def.args.values():
                        bump_all(arg.ast_node)

        if isinstance(named_type, GraphQLEnumType):
            for enum_value in named_type.values.values():
                bump_all(enum_value.ast_node)

    return counts


def _reference_counts(schema: GraphQLSchema) -> list[ReferenceCount]:
    """Reference counts for schema-defined types and custom directives, sorted by count then name."""
    countable_names = {named_type.name for named_type in get_all_named_types(schema) if _is_countable_type(named_type)}
    type_counts = _type_reference_counts(schema)
    entries = [
        ReferenceCount(name=name, count=count, kind="type")
        for name, count in type_counts.items()
        if name in countable_names
    ]

    specified_names = {directive.name for directive in specified_directives}
    directive_counts = _directive_application_counts(schema)
    for name, count in directive_counts.items():
        if name in specified_names:
            continue
        entries.append(ReferenceCount(name=f"@{name}", count=count, kind="directive"))

    entries.sort(key=lambda entry: (-entry.count, entry.name))
    return entries


def compute_relationships(schema: GraphQLSchema) -> RelationshipsResult:
    """Find the object-type reference chains reachable from the schema's root."""
    graph = _object_reference_graph(schema)
    root_type_names = _root_object_type_names(schema, graph)
    paths = _find_all_paths(graph, root_type_names)

    unique_paths = list({tuple(path): path for path in paths}.values())
    multi_hop_paths = [path for path in unique_paths if len(path) >= 2]
    multi_hop_paths.sort(key=len, reverse=True)

    relationship_paths = [RelationshipPath(segments=path, depth=len(path) - 1) for path in multi_hop_paths]
    max_depth = relationship_paths[0] if relationship_paths else None
    cyclic_references = _find_cyclic_references(graph, root_type_names)

    return RelationshipsResult(
        paths=relationship_paths,
        max_depth=max_depth,
        total_paths=len(multi_hop_paths),
        depth_distribution=_depth_distribution(multi_hop_paths),
        cyclic_references=cyclic_references,
        reference_counts=_reference_counts(schema),
    )
