import logging
from pathlib import Path

import click
from graphql import (
    GraphQLField,
    GraphQLObjectType,
    GraphQLScalarType,
    get_named_type,
)
from rdflib import RDF, BNode, Graph, Literal, Namespace

from tools.utils import (
    FieldCase,
    get_all_expanded_instance_tags,
    get_all_objects_with_directive,
    get_all_named_types,
    get_all_object_types,
    get_field_case_extended,
    has_directive,
    load_schema,
)

SUPPORTED_FIELD_CASES = {
    FieldCase.DEFAULT,
    FieldCase.NON_NULL,
    FieldCase.SET,
    FieldCase.SET_NON_NULL,
}
print(f"SUPPORTED_FIELD_CASES {SUPPORTED_FIELD_CASES}")

# Namespaces and prefixes
SH = Namespace("http://www.w3.org/ns/shacl#")
XSD = Namespace("http://www.w3.org/2001/XMLSchema#")

SHAPES_NAMESPACE = None
SHAPES_NAMESPACE_PREFIX = None
MODEL_NAMESPACE = None
MODEL_NAMESPACE_PREFIX = None

INSTANCE_TAGS = None

# Datatype mapping from GraphQL to XSD
GRAPHQL_SCALAR_TO_XSD = {"Int": "integer", "Float": "float", "String": "string", "Boolean": "boolean", "ID": "string"}


def get_xsd_datatype(scalar: GraphQLScalarType) -> str:
    return XSD[GRAPHQL_SCALAR_TO_XSD[scalar.name]]


def translate_to_shacl(
    schema: Path, shapes_namespace: str, shapes_namespace_prefix: str, model_namespace: str, model_namespace_prefix: str
) -> Graph:
    """Translate a GraphQL schema to SHACL."""
    # Set the global variables for the namespaces to avoid passing them as arguments multiple times
    global SHAPES_NAMESPACE, SHAPES_NAMESPACE_PREFIX, MODEL_NAMESPACE, MODEL_NAMESPACE_PREFIX, INSTANCE_TAGS
    SHAPES_NAMESPACE = Namespace(shapes_namespace)
    SHAPES_NAMESPACE_PREFIX = Namespace(shapes_namespace_prefix)
    MODEL_NAMESPACE = Namespace(model_namespace)
    MODEL_NAMESPACE_PREFIX = Namespace(model_namespace_prefix)

    schema_data = load_schema(schema)
    graph = Graph()
    graph.bind("sh", SH)
    graph.bind("xsd", XSD)
    graph.bind(SHAPES_NAMESPACE_PREFIX, SHAPES_NAMESPACE)
    graph.bind(MODEL_NAMESPACE_PREFIX, MODEL_NAMESPACE)

    named_types = get_all_named_types(schema_data)
    object_types = get_all_object_types(named_types)
    logging.debug(f"Object types: {object_types}")
    instance_tag_objects = get_all_objects_with_directive(object_types, "instanceTag")
    logging.debug(f"Instance Tag Objects: {instance_tag_objects}")
    INSTANCE_TAGS = get_all_expanded_instance_tags(schema_data)
    logging.debug(f"Expanded tags from spec: {INSTANCE_TAGS}")
    
    for object_type in object_types:
        if object_type.name == "Query":
            logging.debug("Skipping Query object type.")
            continue
        if has_directive(object_type, "instanceTag"):
            logging.debug(f"Skipping object type '{object_type.name}' with directive 'instanceTag'.")
            continue

        process_object_type(object_type, graph)

    return graph


def process_object_type(object_type: GraphQLObjectType, graph: Graph):
    """Process a GraphQL object type and generate the corresponding SHACL triples."""
    logging.info(f"Processing object type '{object_type.name}'.")
    shape_node = SHAPES_NAMESPACE[object_type.name]
    graph.add((shape_node, RDF.type, SH.NodeShape))
    graph.add((shape_node, SH.name, Literal(object_type.name)))
    graph.add((shape_node, SH.targetClass, MODEL_NAMESPACE[object_type.name]))
    if object_type.description:
        graph.add((shape_node, SH.description, Literal(object_type.description)))

    for field_name, field in object_type.fields.items():
        process_field(field_name, field, shape_node, graph)


def process_field(field_name, field: GraphQLField, shape_node, graph: Graph):
    """Process a field of a GraphQL object type and generate the corresponding SHACL triples."""
    field_case = get_field_case_extended(field)

    # Log the field definition as it appears in the GraphQL SDL
    field_sdl = f"{field_name}: {field.type}"
    if field.ast_node and field.ast_node.directives:
        directives = " ".join([f"@{directive.name.value}" for directive in field.ast_node.directives])
        field_sdl += f" {directives}"
    logging.info(f"Processing field... '{field_sdl}'")
    logging.debug(f"Field case: {field_case}")

    if field_case not in SUPPORTED_FIELD_CASES:
        logging.warning(
            f"Field case '{field_case.name}' is currently not supported by this exporter.\n"
            f"Supported field cases are: {[case.name for case in SUPPORTED_FIELD_CASES]}"
        )
        logging.info(f"Skipping field '{field_name}'")
        return
    else:
        # Add a new property blank node to the shape node
        property_node = BNode()
        graph.add((shape_node, SH.property, property_node))
        graph.add((property_node, SH.name, Literal(field_name)))
        if field.description:
            graph.add((property_node, SH.description, Literal(field.description)))

        field_named_type = get_named_type(field.type)  # GraphQL type without modifiers [] or !

        # Assign field_name as the property path if the field is a scalar type, otherwise use 'has'
        property_path = (
            MODEL_NAMESPACE[f"{field_name}"]
            if isinstance(field_named_type, GraphQLScalarType)
            else MODEL_NAMESPACE["has"]
        )
        graph.add((property_node, SH.path, property_path))

        if isinstance(field_named_type, GraphQLScalarType):
            # Triples specific to scalar types
            graph.add((property_node, SH.nodeKind, SH.Literal))
            graph.add((property_node, SH.datatype, get_xsd_datatype(field_named_type)))
        else:
            # Triples specific to other types (e.g., Object types, Enum types. etc.)
            graph.add((property_node, SH.nodeKind, SH.IRI))
            graph.add((property_node, SH.node, SHAPES_NAMESPACE[field_named_type.name]))
            graph.add((property_node, SH["class"], MODEL_NAMESPACE[field_named_type.name]))

        # TODO: Parse the min and max in the @cardinality directive, implement consitency checking first
        value_cardinality = field_case.value.value_cardinality
        if value_cardinality.min:
            graph.add((property_node, SH.minCount, Literal(value_cardinality.min, datatype=XSD.integer)))
        if value_cardinality.max:
            graph.add((property_node, SH.maxCount, Literal(value_cardinality.max, datatype=XSD.integer)))


@click.command()
@click.argument("schema", type=click.Path(exists=True), required=True)
@click.argument("output", type=click.Path(dir_okay=False, writable=True, path_type=Path), required=True)
@click.argument("serialization_format", type=str, default="ttl")
@click.argument("shapes_namespace", type=str, default="http://example.org/shapes#")
@click.argument("shapes_namespace_prefix", type=str, default="shapes")
@click.argument("model_namespace", type=str, default="http://example.org/ontology#")
@click.argument("model_namespace_prefix", type=str, default="model")
def main(
    schema: Path,
    output: Path,
    serialization_format: str,
    shapes_namespace: str,
    shapes_namespace_prefix: str,
    model_namespace: str,
    model_namespace_prefix: str,
):
    shacl_graph = translate_to_shacl(
        schema, shapes_namespace, shapes_namespace_prefix, model_namespace, model_namespace_prefix
    )
    shacl_graph.serialize(destination=output, format=serialization_format)


if __name__ == "__main__":
    main()
