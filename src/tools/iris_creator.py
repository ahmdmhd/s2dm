import yaml
import rich_click as click
from graphql import build_schema, get_introspection_query, graphql_sync
from typing import Dict, List
from pprint import pprint

def get_iris(schema_file: str, namespace: str) -> Dict[str, List[str]]:
    """
    Constructs and returns the IRIs made out of the name uniqueness of the GraphQL schema and a given namespace.
    Args:
        schema_file (str): The path to the GraphQL schema file.
        namespace (str): The namespace to be used for constructing IRIs.
    Returns:
        dict: A dictionary containing:
            - 'object_types' (list): A sorted list of IRIs for object types.
            - 'scalar_fields' (list): A sorted list of IRIs for scalar fields.
            - 'relationship_fields' (list): A sorted list of IRIs for relationship fields.
            - 'enum_types' (list): A sorted list of IRIs for enum types.
    """
    
    with open(schema_file, 'r') as file:
        schema_str = file.read()

    schema = build_schema(schema_str)
    introspection_result = graphql_sync(schema, get_introspection_query())

    if introspection_result.errors:
        raise Exception(f"Introspection query failed: {introspection_result.errors}")

    schema_data = introspection_result.data['__schema']
    pprint(schema_data)
    object_types = []
    scalar_fields = []
    relationships_fields = []
    enum_types = []
    
    for type_data in schema_data['types']:
        if type_data['kind'] == 'OBJECT' and not type_data['name'].startswith('__'):
            type_name = type_data['name']
            object_types.append(f"{namespace}:{type_name}")
            for field in type_data['fields']:
                field_name = field['name']
                field_type = field['type']
                while 'ofType' in field_type and field_type['ofType']:
                    field_type = field_type['ofType']
                field_type_name = field_type['name']

                if field_type_name in ['Int', 'Float', 'String', 'Boolean', 'ID']:
                    scalar_fields.append(f"{namespace}:{type_name}.{field_name}")
                else:
                    relationships_fields.append(f"{namespace}:{type_name}.{field_name}")
        elif type_data['kind'] == 'ENUM' and not type_data['name'].startswith('__'):
            enum_name = type_data['name']
            enum_types.append(f"{namespace}:{enum_name}")
   

    object_types.sort()
    scalar_fields.sort()
    relationships_fields.sort()
    enum_types.sort()

    return {'object_types': object_types, 'scalar_fields': scalar_fields, 'relationship_fields': relationships_fields, 'enum_types': enum_types}

def write_yaml(data, output_file):
    with open(output_file, 'w') as file:
        yaml.dump(data, file)

@click.command()
@click.argument('schema_file', type=click.Path(exists=True))
@click.argument('namespace', type=str)
@click.argument('output_file', type=click.Path())
def main(schema_file, namespace, output_file):
    """Generate IRIs from a GraphQL schema."""
    iris = get_iris(schema_file, namespace)
    
    # Print the resulting YAML to the console
    print(yaml.dump(iris))
    
    write_yaml(iris, output_file)

if __name__ == '__main__':
    main()
