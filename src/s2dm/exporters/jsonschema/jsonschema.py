import logging
import json
from pathlib import Path

from s2dm.exporters.utils import load_schema, build_schema_str
from .transformer import transform_to_json_schema

log = logging.getLogger(__name__)


def translate_to_jsonschema(schema_path: Path) -> str:
    """
    Translate a GraphQL schema to JSON Schema format.
    
    Args:
        schema_path: Path to a GraphQL schema file or directory containing schema files
        
    Returns:
        str: JSON Schema representation as a string
    """
    log.info(f"Translating GraphQL schema to JSON Schema: {schema_path}")
    
    # Load the GraphQL schema from the file or directory
    graphql_schema = load_schema(schema_path)
    log.info(f"Successfully loaded GraphQL schema with {len(graphql_schema.type_map)} types")
    
    # Transform the GraphQL schema to JSON Schema
    json_schema = transform_to_json_schema(graphql_schema)
    
    # Convert to JSON string
    json_schema_str = json.dumps(json_schema, indent=2)
    
    log.info("Successfully converted GraphQL schema to JSON Schema")
    
    return json_schema_str