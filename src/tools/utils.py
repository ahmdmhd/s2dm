import logging
import os
from typing import Any

from graphql import (
    GraphQLString,
    build_schema,
)
from graphql.type import GraphQLField, GraphQLNamedType, GraphQLObjectType, GraphQLSchema
from graphql.utilities import print_schema

# Configure logging
logging.basicConfig(level=logging.DEBUG)


def read_file(file_path: str) -> str:
    """
    Read the content of a file.
    Args:
        file_path (str): The path to the file.
    Returns:
        str: The content of the file.
    Raises:
        Exception: If the file does not exist.
    """
    if not os.path.exists(file_path):
        raise Exception(f"The provided file does not exist: {file_path}")

    with open(file_path, encoding="utf-8") as file:
        return file.read()


def load_schema(graphql_schema_file) -> GraphQLSchema:
    """
    Load and build a GraphQL schema from a file.
    This function reads a GraphQL schema definition from a file, converts it
    into a GraphQLSchema object, and ensures that the schema supports queries.
    Args:
        graphql_schema_file (str): The path to the GraphQL schema file.
    Returns:
        GraphQLSchema: The constructed GraphQL schema object.
    """
    # Read custom directives from file
    custom_directives_file = os.path.join(os.path.dirname(__file__), "..", "spec", "custom_directives.graphql")
    custom_directives_str = read_file(custom_directives_file)

    # Build schema with custom directives
    schema_str = custom_directives_str + "\n" + read_file(graphql_schema_file)

    schema = build_schema(schema_str)  # Convert GraphQL SDL to a GraphQLSchema object
    logging.info("Successfully loaded the given GraphQL schema file.")
    logging.debug(f"Read schema: \n{print_schema(schema)}")
    return ensure_query(schema)


def ensure_query(schema: GraphQLSchema) -> GraphQLSchema:
    """
    Ensures that the provided GraphQL schema has a Query type. If the schema does not have a Query type,
    a generic Query type is added.

    Args:
        schema (GraphQLSchema): The GraphQL schema to check and potentially modify.

    Returns:
        GraphQLSchema: The original schema if it already has a Query type, otherwise a new schema with a
        generic Query type added.
    """
    if not schema.query_type:
        logging.info("The provided schema has no Query type.")
        query_fields = {"ping": GraphQLField(GraphQLString)}  # Add here other generic fields if needed
        query_type = GraphQLObjectType(name="Query", fields=query_fields)
        new_schema = GraphQLSchema(query=query_type, types=schema.type_map.values(), directives=schema.directives)
        logging.info("A generic Query type to the schema was added.")
        logging.debug(f"New schema: \n{print_schema(new_schema)}")

        return new_schema

    return schema


def get_all_named_types(schema: GraphQLSchema) -> list[GraphQLNamedType]:
    """
    Extracts all named types from the provided GraphQL schema.
    Args:
        schema (GraphQLSchema): The GraphQL schema to extract named types from.
    Returns:
        list[GraphQLNamedType]: A list of all named types in the schema.
    """    
    return [
        type_
        for type_ in schema.type_map.values()
        if isinstance(type_, GraphQLNamedType) and not type_.name.startswith("__")
    ]


def get_all_object_types(named_types: list[GraphQLNamedType]) -> list[GraphQLObjectType]:
    """
    Extracts all object types from the provided GraphQL schema.
    Args:
        schema (GraphQLSchema): The GraphQL schema to extract object types from.
    Returns:
        list[GraphQLObjectType]: A list of all object types in the schema.
    """
    return [type_ for type_ in named_types if isinstance(type_, GraphQLObjectType)]


def get_directive_arguments(field: GraphQLField, directive_name: str) -> dict[str, Any]:
    """
    Extracts the arguments of a specified directive from a GraphQL field.
    Args:
        field (GraphQLField): The GraphQL field from which to extract the directive arguments.
        directive_name (str): The name of the directive whose arguments are to be extracted.
    Returns:
        dict[str, Any]: A dictionary containing the directive arguments as key-value pairs.
                        Returns an empty dictionary if the directive is not found.
    Logs:
        Logs a debug message if the specified directive is not found in the field.
    """

    if field.ast_node and field.ast_node.directives:
        for directive in field.ast_node.directives:
            if directive.name.value == directive_name:
                return {arg.name.value: arg.value.value for arg in directive.arguments}
    logging.debug(f"Directive '{directive_name}' not found in field '{field.ast_node.name.value}'.")
    return {}


def get_cardinality(field: GraphQLField) -> tuple[int, int]:
    """
    Retrieve the cardinality of a given GraphQL field.
    This function extracts the 'cardinality' directive arguments from the provided
    GraphQL field and returns a tuple containing the minimum and maximum values.
    Args:
        field (GraphQLField): The GraphQL field from which to extract the cardinality.
    Returns:
        tuple[int, int]: A tuple containing the minimum and maximum cardinality values.
                         If the 'min' or 'max' values are not found, None is returned
                         in their place.
    """

    cardinality = get_directive_arguments(field, "cardinality")
    min_value = cardinality.get("min", None)  # Provide a default value if 'min' is not found
    max_value = cardinality.get("max", None)  # Provide a default value if 'max' is not found
    return min_value, max_value


def validate_field(field: GraphQLField) -> bool:
    """
    Check whether a GraphQL field is valid.
    For example: If the field has a 'cardinality' directive,
    this must not contradict the non nullability of the field.
    """
    # TODO: Add a check to avoid discrepancy between GraphQL not null and SHACL min cardinality
    pass
