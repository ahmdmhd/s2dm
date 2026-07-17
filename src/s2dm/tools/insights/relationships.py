"""Deepest object-reference paths reachable from the schema's root."""

from graphql import GraphQLObjectType, GraphQLSchema, get_named_type

from s2dm.exporters.utils.extraction import get_all_named_types
from s2dm.exporters.utils.graphql_type import is_root_type
from s2dm.tools.insights.models import DepthCount, RelationshipPath, RelationshipsResult


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


def _depth_distribution(paths: list[list[str]]) -> list[DepthCount]:
    counts_by_depth: dict[int, int] = {}
    for path in paths:
        depth = len(path) - 1
        counts_by_depth[depth] = counts_by_depth.get(depth, 0) + 1
    return [DepthCount(depth=depth, count=counts_by_depth[depth]) for depth in sorted(counts_by_depth)]


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

    return RelationshipsResult(
        paths=relationship_paths,
        max_depth=max_depth,
        total_paths=len(multi_hop_paths),
        depth_distribution=_depth_distribution(multi_hop_paths),
    )
