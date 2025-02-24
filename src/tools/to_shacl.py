import logging

import click
from graphql import GraphQLNonNull, GraphQLScalarType
from rdflib import RDF, BNode, Graph, Literal, Namespace
from utils import get_all_named_types, get_all_object_types, get_cardinality, load_schema

SH = Namespace('http://www.w3.org/ns/shacl#')
XSD = Namespace('http://www.w3.org/2001/XMLSchema#')

GRAPHQL_SCALAR_TO_XSD = {
    'Int': 'integer',
    'Float': 'float',
    'String': 'string',
    'Boolean': 'boolean',
    'ID': 'string'
}

def get_xsd_datatype(gql_scalar: GraphQLScalarType) -> str:
    return XSD[GRAPHQL_SCALAR_TO_XSD[gql_scalar.name]]

def translate_to_shacl(schema_data, 
                       shapes_namespace,
                       shapes_namespace_prefix,
                       model_namespace,
                       model_namespace_prefix):
    shacl_graph = Graph()
    
    shapes_namespace = Namespace(shapes_namespace)
    model_namespace = Namespace(model_namespace)

    shacl_graph.bind('sh', SH)
    shacl_graph.bind('xsd', XSD)
    shacl_graph.bind(shapes_namespace_prefix, shapes_namespace)
    shacl_graph.bind(model_namespace_prefix, model_namespace)

    named_types = get_all_named_types(schema_data)
    logging.debug(f"Named types: {named_types}")
    object_types = get_all_object_types(named_types)
    logging.debug(f"Object types: {object_types}")

    for object_type in object_types:
        if object_type.name == 'Query':
            continue
        shape_node = shapes_namespace[object_type.name]
        shacl_graph.add((shape_node, RDF.type, SH.NodeShape))
        shacl_graph.add((shape_node, SH.name, Literal(object_type.name)))
        shacl_graph.add((shape_node, SH.targetClass, model_namespace[object_type.name]))
        if object_type.description:
            shacl_graph.add((shape_node, SH.description, Literal(object_type.description)))
        
        for field_name, field in object_type.fields.items():
            property_node = BNode()
            shacl_graph.add((shape_node, SH.property, property_node))
            shacl_graph.add((property_node, SH.path, model_namespace[f"{object_type.name}.{field_name}"]))
            shacl_graph.add((property_node, SH.name, Literal(field_name)))
            
            if field.description:
                shacl_graph.add((property_node, SH.description, Literal(field.description)))
            
            # TODO: Add a check to avoid discrepancy between GraphQL not null and SHACL min cardinality
            min, max = get_cardinality(field)
            if min:
                shacl_graph.add((property_node, SH.minCount, Literal(min, datatype=XSD.integer)))
            if max:
                shacl_graph.add((property_node, SH.maxCount, Literal(max, datatype=XSD.integer)))
            
            if isinstance(field.type, GraphQLNonNull):
                shacl_graph.add((property_node, SH.minCount, Literal(1, datatype=XSD.integer)))
                if isinstance(field.type.of_type, GraphQLScalarType):
                    shacl_graph.add((property_node, SH.datatype, get_xsd_datatype(field.type.of_type)))
            else:
                shacl_graph.add((property_node, SH.datatype, get_xsd_datatype(field.type)))        

    return shacl_graph



@click.command()
@click.argument('graphql_schema_file', type=click.Path(exists=True))
@click.argument('output_file', type=click.Path())
@click.argument('serialization_format', type=str, default='turtle')
@click.argument('shapes_namespace', type=str, default='http://example.org/shapes#')
@click.argument('shapes_namespace_prefix', type=str, default='shapes')
@click.argument('model_namespace', type=str, default='http://example.org/ontology#')
@click.argument('model_namespace_prefix', type=str, default='model')
def main(graphql_schema_file, 
         output_file,
         serialization_format,
         shapes_namespace, 
         shapes_namespace_prefix , 
         model_namespace, 
         model_namespace_prefix):
    schema = load_schema(graphql_schema_file)
    shacl_graph = translate_to_shacl(schema, 
                                     shapes_namespace, 
                                     shapes_namespace_prefix, 
                                     model_namespace, 
                                     model_namespace_prefix)
    
    shacl_graph.serialize(destination=output_file, format=serialization_format)

if __name__ == '__main__':
    main()