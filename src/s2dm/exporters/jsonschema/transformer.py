import logging
from typing import Dict, Any, List, Optional
from graphql import (
    GraphQLSchema, 
    GraphQLObjectType, 
    GraphQLScalarType,
    GraphQLEnumType,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLUnionType,
    GraphQLType,
    GraphQLField,
    is_scalar_type,
    is_object_type,
    is_enum_type,
    is_input_object_type,
    is_interface_type,
    is_union_type,
    is_list_type,
    is_non_null_type
)

log = logging.getLogger(__name__)

# GraphQL scalar to JSON Schema type mapping
GRAPHQL_SCALAR_TO_JSON_SCHEMA = {
    "String": "string",
    "Int": "integer",
    "Float": "number",
    "Boolean": "boolean",
    "ID": "string",
    "Int8": "integer",
    "UInt8": "integer",
    "Int16": "integer",
    "UInt16": "integer",
    "UInt32": "integer",
    "Int64": "integer",
    "UInt64": "integer",
}


def transform_to_json_schema(graphql_schema: GraphQLSchema) -> Dict[str, Any]:
    """
    Transform a GraphQL schema to JSON Schema format.
    
    Converts all GraphQL types (except Query/Mutation/Subscription) into JSON Schema
    definitions in the $defs section. Handles directives as well.
    
    Args:
        graphql_schema: The GraphQL schema object to transform
        
    Returns:
        Dict[str, Any]: JSON Schema representation
    """
    log.info("Starting GraphQL to JSON Schema transformation")
    
    json_schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "title": "GraphQL Schema",
        "description": "JSON Schema generated from GraphQL schema",
        "$defs": {}
    }
    
    type_map = graphql_schema.type_map
    excluded_types = {"Query", "Mutation", "Subscription"}
    
    # Filter out built-in types (those starting with __) and root operation types
    user_defined_types = {
        name: type_def for name, type_def in type_map.items() 
        if not name.startswith('__') and name not in excluded_types
    }
    
    log.info(f"Found {len(user_defined_types)} user-defined types to transform")
    
    for type_name, type_def in user_defined_types.items():
        try:
            json_schema_def = transform_graphql_type(type_def)
            if json_schema_def:
                json_schema["$defs"][type_name] = json_schema_def
                log.debug(f"Transformed type: {type_name}")
        except Exception as e:
            log.error(f"Failed to transform type {type_name}: {e}")
            continue
    
    log.info(f"Successfully transformed {len(json_schema['$defs'])} types")
    return json_schema


def transform_graphql_type(graphql_type: GraphQLType) -> Optional[Dict[str, Any]]:
    """
    Transform a single GraphQL type to JSON Schema definition.
    
    Args:
        graphql_type: The GraphQL type to transform
        
    Returns:
        Optional[Dict[str, Any]]: JSON Schema definition or None if not transformable
    """
    if is_scalar_type(graphql_type):
        return transform_scalar_type(graphql_type)
    elif is_object_type(graphql_type):
        return transform_object_type(graphql_type)
    elif is_enum_type(graphql_type):
        return transform_enum_type(graphql_type)
    elif is_input_object_type(graphql_type):
        return transform_input_object_type(graphql_type)
    elif is_interface_type(graphql_type):
        return transform_interface_type(graphql_type)
    elif is_union_type(graphql_type):
        return transform_union_type(graphql_type)
    else:
        log.warning(f"Unsupported GraphQL type: {type(graphql_type)}")
        return None


def transform_scalar_type(scalar_type: GraphQLScalarType) -> Dict[str, Any]:
    """
    Transform a GraphQL scalar type to JSON Schema.
    
    Args:
        scalar_type: The GraphQL scalar type
        
    Returns:
        Dict[str, Any]: JSON Schema definition
    """
    json_type = GRAPHQL_SCALAR_TO_JSON_SCHEMA.get(scalar_type.name, "string")
    
    definition = {
        "type": json_type,
        "description": scalar_type.description or f"GraphQL scalar type: {scalar_type.name}"
    }
    
    # Add custom scalar metadata
    # if scalar_type.name not in ["String", "Int", "Float", "Boolean", "ID"]:
    #     definition["x-graphql-scalar"] = scalar_type.name
    
    return definition


def transform_object_type(object_type: GraphQLObjectType) -> Dict[str, Any]:
    """
    Transform a GraphQL object type to JSON Schema.
    
    Args:
        object_type: The GraphQL object type
        
    Returns:
        Dict[str, Any]: JSON Schema definition
    """
    definition = {
        "type": "object",
        "description": object_type.description or f"GraphQL object type: {object_type.name}",
        "properties": {},
        "required": []
    }
    
    # Process directives
    if hasattr(object_type, 'ast_node') and object_type.ast_node and object_type.ast_node.directives:
        directive_extensions = process_directives(object_type.ast_node.directives)
        definition.update(directive_extensions)
    
    # Process fields
    for field_name, field in object_type.fields.items():
        field_definition = transform_field(field)
        definition["properties"][field_name] = field_definition
        
        if is_non_null_type(field.type):
            definition["required"].append(field_name)
    
    if not definition["required"]:
        del definition["required"]
    
    return definition


def transform_field(field: GraphQLField) -> Dict[str, Any]:
    """
    Transform a GraphQL field to JSON Schema property.
    
    Args:
        field: The GraphQL field
        
    Returns:
        Dict[str, Any]: JSON Schema property definition
    """
    field_type = field.type
    definition = get_field_type_definition(field_type)
    
    if field.description:
        definition["description"] = field.description
    
    # Process field directives
    if hasattr(field, 'ast_node') and field.ast_node and field.ast_node.directives:
        directive_extensions = process_directives(field.ast_node.directives)
        definition.update(directive_extensions)
    
    return definition


def get_field_type_definition(field_type: GraphQLType) -> Dict[str, Any]:
    """
    Get JSON Schema definition for a GraphQL field type.
    
    Args:
        field_type: The GraphQL field type
        
    Returns:
        Dict[str, Any]: JSON Schema type definition
    """
    # Handle NonNull wrapper. e.g. `Type!`
    if is_non_null_type(field_type):
        return get_field_type_definition(field_type.of_type)
    
    # Handle List wrapper
    if is_list_type(field_type):
        item_definition = get_field_type_definition(field_type.of_type)
        
        # Check if the list items are nullable (not wrapped in NonNull). e.g. `[Type]`
        # This handles cases like [Type] where items can be null: [Type, null, Type, ...]
        if not is_non_null_type(field_type.of_type):
            # For nullable items, allow the item type or null
            if "$ref" in item_definition:
                # For object/union references, use oneOf
                item_definition = {
                    "oneOf": [
                        item_definition,
                        {"type": "null"}
                    ]
                }
            elif "type" in item_definition:
                # For primitive types, add null to the possible types array
                current_type = item_definition["type"]
                if isinstance(current_type, str):
                    item_definition["type"] = [current_type, "null"]
                elif isinstance(current_type, list) and "null" not in current_type:
                    item_definition["type"] = current_type + ["null"]
        
        return {
            "type": "array",
            "items": item_definition
        }
    
    # Handle scalar types
    if is_scalar_type(field_type):
        json_type = GRAPHQL_SCALAR_TO_JSON_SCHEMA.get(field_type.name, "string")
        return {"type": json_type}
    
    # Handle enum types
    if is_enum_type(field_type):
        enum_values = []
        for value in field_type.values:
            if hasattr(value, 'name'):
                enum_values.append(value.name)
            else:
                enum_values.append(str(value))
        return {
            "type": "string",
            "enum": enum_values
        }
    
    # Handle object types (references)
    if is_object_type(field_type) or is_input_object_type(field_type) or is_interface_type(field_type):
        return {"$ref": f"#/$defs/{field_type.name}"}
    
    # Handle union types
    if is_union_type(field_type):
        return {"$ref": f"#/$defs/{field_type.name}"}
    
    return {"type": "string"}


def process_directives(directives: List[Any]) -> Dict[str, Any]:
    """
    Process GraphQL directives and convert them to JSON Schema extensions.
    
    Args:
        directives: List of GraphQL directive nodes
        
    Returns:
        Dict[str, Any]: JSON Schema extensions for the directives
    """
    extensions = {}
    
    for directive in directives:
        directive_name = directive.name.value
        
        if directive_name == "cardinality":
            args = get_directive_arguments(directive)
            if "min" in args:
                extensions["minItems"] = args["min"]
            if "max" in args:
                extensions["maxItems"] = args["max"]
        
        elif directive_name == "noDuplicates":
            extensions["uniqueItems"] = True
        
        elif directive_name == "range":
            args = get_directive_arguments(directive)
            if "min" in args:
                extensions["minimum"] = args["min"]
            if "max" in args:
                extensions["maximum"] = args["max"]
        
        else:
            """
            All other custom directives are included as an `x-` prefixed directive.

            Directives with arguments are stored as an object, while those without
            arguments are stored as a boolean.
            """
            args = get_directive_arguments(directive)
            if args:
                extensions[f"x-{directive_name}"] = args
            else:
                extensions[f"x-{directive_name}"] = True
    
    return extensions


def get_directive_arguments(directive: Any) -> Dict[str, Any]:
    """
    Extract arguments from a GraphQL directive.
    
    Args:
        directive: GraphQL directive node
        
    Returns:
        Dict[str, Any]: Dictionary of argument names to values
    """
    args = {}
    
    if hasattr(directive, 'arguments') and directive.arguments:
        for arg in directive.arguments:
            arg_name = arg.name.value
            if hasattr(arg.value, 'value'):
                args[arg_name] = arg.value.value
            else:
                args[arg_name] = str(arg.value)
    
    return args


def transform_enum_type(enum_type: GraphQLEnumType) -> Dict[str, Any]:
    """
    Transform a GraphQL enum type to JSON Schema.
    
    Args:
        enum_type: The GraphQL enum type
        
    Returns:
        Dict[str, Any]: JSON Schema definition
    """
    enum_values = []
    for value in enum_type.values:
        # Handle enum values which might be strings or objects with .name attribute
        if hasattr(value, 'name'):
            enum_values.append(value.name)
        else:
            enum_values.append(str(value))
    
    return {
        "type": "string",
        "enum": enum_values,
        "description": enum_type.description or f"GraphQL enum type: {enum_type.name}"
    }


def transform_input_object_type(input_type: GraphQLInputObjectType) -> Dict[str, Any]:
    """
    Transform a GraphQL input object type to JSON Schema.
    
    Args:
        input_type: The GraphQL input object type
        
    Returns:
        Dict[str, Any]: JSON Schema definition
    """
    definition = {
        "type": "object",
        "description": input_type.description or f"GraphQL input type: {input_type.name}",
        "properties": {},
        "required": []
    }
    
    for field_name, field in input_type.fields.items():
        field_definition = get_field_type_definition(field.type)
        
        if field.description:
            field_definition["description"] = field.description
        
        # Add default value if present and serializable
        if field.default_value is not None:
            try:
                # Test if the value is JSON serializable
                import json
                json.dumps(field.default_value)
                field_definition["default"] = field.default_value
            except (TypeError, ValueError):
                # Skip non-serializable default values
                pass
        
        definition["properties"][field_name] = field_definition
        
        if is_non_null_type(field.type):
            definition["required"].append(field_name)
    
    if not definition["required"]:
        del definition["required"]
    
    return definition


def transform_interface_type(interface_type: GraphQLInterfaceType) -> Dict[str, Any]:
    """
    Transform a GraphQL interface type to JSON Schema.
    
    Args:
        interface_type: The GraphQL interface type
        
    Returns:
        Dict[str, Any]: JSON Schema definition
    """
    definition = {
        "type": "object",
        "description": interface_type.description or f"GraphQL interface type: {interface_type.name}",
        "properties": {},
        "required": []
    }
    
    for field_name, field in interface_type.fields.items():
        field_definition = transform_field(field)
        definition["properties"][field_name] = field_definition
        
        if is_non_null_type(field.type):
            definition["required"].append(field_name)
    
    if not definition["required"]:
        del definition["required"]
    
    return definition


def transform_union_type(union_type: GraphQLUnionType) -> Dict[str, Any]:
    """
    Transform a GraphQL union type to JSON Schema.
    
    Args:
        union_type: The GraphQL union type
        
    Returns:
        Dict[str, Any]: JSON Schema definition
    """
    return {
        "oneOf": [
            {"$ref": f"#/$defs/{member_type.name}"} 
            for member_type in union_type.types
        ],
        "description": union_type.description or f"GraphQL union type: {union_type.name}"
    }
