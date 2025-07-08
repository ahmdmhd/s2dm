"""
Graph traversal utilities for GraphQL schema analysis.
"""

import logging
from typing import Set
from graphql import (
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInterfaceType,
    GraphQLUnionType,
    GraphQLInputObjectType,
    GraphQLType,
    is_object_type,
    is_interface_type,
    is_union_type,
    is_input_object_type,
    is_non_null_type,
    is_list_type,
)

log = logging.getLogger(__name__)


def get_referenced_types(graphql_schema: GraphQLSchema, root_node: str) -> Set[str]:
    """
    Find all GraphQL types referenced from the root node through graph traversal.
    
    Args:
        graphql_schema: The GraphQL schema
        root_node: The root node to start traversal from
        
    Returns:
        Set[str]: Set of referenced type names
    """
    visited: Set[str] = set()
    referenced: Set[str] = set()
    
    def visit_type(type_name: str) -> None:
        if type_name in visited:
            return
        
        visited.add(type_name)
        
        if type_name.startswith('__'):
            return
            
        if type_name in {'Query', 'Mutation', 'Subscription'}:
            return
            
        referenced.add(type_name)
        
        type_def = graphql_schema.type_map.get(type_name)
        if not type_def:
            return
        
        # Traverse based on type kind
        if is_object_type(type_def):
            visit_object_type(type_def)
        elif is_interface_type(type_def):
            visit_interface_type(type_def)
        elif is_union_type(type_def):
            visit_union_type(type_def)
        elif is_input_object_type(type_def):
            visit_input_object_type(type_def)
        # Scalar and enum types don't reference other types
    
    def visit_object_type(obj_type: GraphQLObjectType) -> None:
        for field in obj_type.fields.values():
            visit_field_type(field.type)
        
        for interface in obj_type.interfaces:
            visit_type(interface.name)
    
    def visit_interface_type(interface_type: GraphQLInterfaceType) -> None:
        for field in interface_type.fields.values():
            visit_field_type(field.type)
    
    def visit_union_type(union_type: GraphQLUnionType) -> None:
        for member_type in union_type.types:
            visit_type(member_type.name)
    
    def visit_input_object_type(input_type: GraphQLInputObjectType) -> None:
        for field in input_type.fields.values():
            visit_field_type(field.type)
    
    def visit_field_type(field_type: GraphQLType) -> None:
        unwrapped_type = field_type
        while is_non_null_type(unwrapped_type) or is_list_type(unwrapped_type):
            unwrapped_type = unwrapped_type.of_type
        
        if hasattr(unwrapped_type, 'name'):
            visit_type(unwrapped_type.name)
    
    visit_type(root_node)
    
    log.info(f"Found {len(referenced)} referenced types from root node '{root_node}'")
    return referenced