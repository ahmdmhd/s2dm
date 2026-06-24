import re
from typing import Any

from graphql import (
    ArgumentNode,
    DirectiveDefinitionNode,
    DirectiveLocation,
    DirectiveNode,
    FloatValueNode,
    GraphQLEnumType,
    GraphQLEnumValue,
    GraphQLField,
    GraphQLInputField,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLType,
    GraphQLUnionType,
    InputValueDefinitionNode,
    IntValueNode,
    ListValueNode,
    NonNullTypeNode,
    ScalarTypeDefinitionNode,
)
from graphql.language.printer import print_ast

from s2dm.constants.directive import BuiltInDirective

GRAPHQL_TYPE_DEFINITION_PATTERN = r"^(type|interface|input|enum|union|scalar)\s+(\w+)"

DirectiveElement = (
    GraphQLField
    | GraphQLInputField
    | GraphQLObjectType
    | GraphQLInterfaceType
    | GraphQLInputObjectType
    | GraphQLEnumType
    | GraphQLEnumValue
)


def get_type_directive_location(graphql_type: GraphQLType) -> DirectiveLocation | None:
    """Get the directive location for a GraphQL type."""
    if isinstance(graphql_type, GraphQLObjectType):
        return DirectiveLocation.OBJECT
    if isinstance(graphql_type, GraphQLInterfaceType):
        return DirectiveLocation.INTERFACE
    if isinstance(graphql_type, GraphQLUnionType):
        return DirectiveLocation.UNION
    if isinstance(graphql_type, GraphQLEnumType):
        return DirectiveLocation.ENUM
    if isinstance(graphql_type, GraphQLScalarType):
        return DirectiveLocation.SCALAR
    if isinstance(graphql_type, GraphQLInputObjectType):
        return DirectiveLocation.INPUT_OBJECT
    return None


def get_directive_arguments(element: DirectiveElement, directive_name: str) -> dict[str, Any]:
    """
    Extracts the arguments of a specified directive from a GraphQL element.
    Args:
        element: The GraphQL element from which to extract the directive arguments.
        directive_name: The name of the directive whose arguments are to be extracted.
    Returns:
        dict[str, Any]: A dictionary containing the directive arguments with proper type conversion.
    """
    if not has_given_directive(element, directive_name) or not element.ast_node:
        return {}

    directive = next(d for d in element.ast_node.directives if d.name.value == directive_name)
    args: dict[str, Any] = {}

    def convert_value(value_node: Any) -> Any:
        if isinstance(value_node, IntValueNode):
            return int(value_node.value)

        if isinstance(value_node, FloatValueNode):
            return float(value_node.value)

        if isinstance(value_node, ListValueNode):
            return [convert_value(item) for item in value_node.values]

        raw_value = getattr(value_node, "value", None)
        if raw_value is not None:
            return raw_value

        return value_node

    for arg in directive.arguments:
        arg_name = arg.name.value
        args[arg_name] = convert_value(arg.value)

    return args


def has_given_directive(element: DirectiveElement, directive_name: str) -> bool:
    """Check whether a GraphQL element (field, object type) has a particular specified directive."""
    if element.ast_node and element.ast_node.directives:
        for directive in element.ast_node.directives:
            if directive.name.value == directive_name:
                return True
    return False


def is_required_input_value_definition(argument: InputValueDefinitionNode) -> bool:
    """Return whether an AST input value definition must be provided by callers."""
    is_non_null = isinstance(argument.type, NonNullTypeNode)
    has_default = argument.default_value is not None
    return is_non_null and not has_default


def is_directive_definition_superset(
    candidate: DirectiveDefinitionNode,
    definition: DirectiveDefinitionNode,
) -> bool:
    """Return whether a directive definition can safely replace another definition."""
    if candidate.name.value != definition.name.value:
        return False
    if definition.repeatable and not candidate.repeatable:
        return False

    candidate_locations = {location.value for location in candidate.locations}
    definition_locations = {location.value for location in definition.locations}
    if not definition_locations.issubset(candidate_locations):
        return False

    candidate_arguments = {argument.name.value: argument for argument in candidate.arguments}
    definition_arguments = {argument.name.value: argument for argument in definition.arguments}

    for definition_argument in definition_arguments.values():
        if not _has_matching_input_value_definition(candidate_arguments, definition_argument):
            return False

    for argument_name, candidate_argument in candidate_arguments.items():
        if argument_name in definition_arguments:
            continue
        if is_required_input_value_definition(candidate_argument):
            return False

    return True


def is_applied_directive_superset(candidate: DirectiveNode, definition: DirectiveNode) -> bool:
    """Return whether an applied directive can safely replace another applied directive."""
    if candidate.name.value != definition.name.value:
        return False

    candidate_arguments = {argument.name.value: argument for argument in candidate.arguments}
    definition_arguments = {argument.name.value: argument for argument in definition.arguments}
    for definition_argument in definition_arguments.values():
        if not _has_matching_applied_argument_value(candidate_arguments, definition_argument):
            return False

    return True


def _has_matching_input_value_definition(
    candidate_arguments: dict[str, InputValueDefinitionNode],
    definition_argument: InputValueDefinitionNode,
) -> bool:
    candidate_argument = candidate_arguments.get(definition_argument.name.value)
    return candidate_argument is not None and candidate_argument.to_dict() == definition_argument.to_dict()


def _has_matching_applied_argument_value(
    candidate_arguments: dict[str, ArgumentNode],
    definition_argument: ArgumentNode,
) -> bool:
    candidate_argument = candidate_arguments.get(definition_argument.name.value)
    return candidate_argument is not None and candidate_argument.value.to_dict() == definition_argument.value.to_dict()


def is_scalar_definition_superset(
    candidate: ScalarTypeDefinitionNode,
    definition: ScalarTypeDefinitionNode,
) -> bool:
    """Return whether a scalar definition can safely replace another scalar definition."""
    if candidate.name.value != definition.name.value:
        return False
    if not definition.directives:
        return True

    candidate_directives = {directive.name.value: directive for directive in candidate.directives}
    definition_directives = {directive.name.value: directive for directive in definition.directives}
    for directive_name, definition_directive in definition_directives.items():
        candidate_directive = candidate_directives.get(directive_name)
        if candidate_directive is None:
            return False
        if not is_applied_directive_superset(candidate_directive, definition_directive):
            return False

    return True


def get_field_with_applied_directive(
    object_type: GraphQLObjectType, directive_to_check: str
) -> dict[str, GraphQLField]:
    """
    Collect all fields of an object type that have the given directive applied.

    Args:
        object_type: The object type whose fields are inspected.
        directive_to_check: The name of the directive to look for on each field.

    Returns:
        dict[str, GraphQLField]: A mapping of field name to field for every field carrying the directive.
    """
    return {
        field_name: field
        for field_name, field in object_type.fields.items()
        if has_given_directive(field, directive_to_check)
    }


def get_objects_with_multiple_fields_with_directive(
    object_types: list[GraphQLObjectType], directive_to_check: str
) -> dict[str, list[str]]:
    """
    Find object types that declare more than one field with the given directive applied.

    Args:
        object_types: The object types to inspect.
        directive_to_check: The name of the directive to look for on each field.

    Returns:
        dict[str, list[str]]: Mapping of object type name to its matching field names,
        for each object type that declares more than one such field.
    """
    objects: dict[str, list[str]] = {}
    for object_type in object_types:
        fields_with_directive = list(get_field_with_applied_directive(object_type, directive_to_check))
        if len(fields_with_directive) > 1:
            objects[object_type.name] = fields_with_directive
    return objects


def get_argument_content(element: DirectiveElement, directive_name: str, argument_name: str) -> Any | None:
    """
    Extracts the comment from a GraphQL element (field or named type).

    Args:
        element (GraphQLNamedType | GraphQLField): The GraphQL element to extract the comment from.
        directive_name: The name of the directive whose arguments are to be extracted.
        argument_name: The name of the argument whose content is to be extracted.

    Returns:
        str | None: The comment if present, otherwise None.
    """
    args = get_directive_arguments(element, directive_name)
    return args.get(argument_name) if args and argument_name in args else None


def format_directive_from_ast(directive_node: Any) -> str:
    directive_name = directive_node.name.value
    if directive_name in {BuiltInDirective.DEPRECATED, BuiltInDirective.SPECIFIED_BY}:
        return ""

    args_str = ""
    if directive_node.arguments:
        args_list = []
        for arg_node in directive_node.arguments:
            arg_name = arg_node.name.value
            # Use graphql-core's print_ast to properly serialize all value types
            arg_value = print_ast(arg_node.value)
            args_list.append(f"{arg_name}: {arg_value}")
        args_str = f"({', '.join(args_list)})"

    return f"@{directive_name}{args_str}"


def build_directive_map(schema: GraphQLSchema) -> dict[str | tuple[str, str], list[str]]:
    directive_map: dict[str | tuple[str, str], list[str]] = {}

    # Helper functions to avoid code duplication
    def has_directives(value: Any) -> bool:
        return bool(
            hasattr(value, "ast_node")
            and value.ast_node
            and hasattr(value.ast_node, "directives")
            and value.ast_node.directives
        )

    def get_directive_strings(value: Any) -> list[str]:
        directive_strings = []
        for directive_node in value.ast_node.directives:
            directive_str = format_directive_from_ast(directive_node)
            if directive_str:
                directive_strings.append(directive_str)
        return directive_strings

    DIRECTIVE_RELATED_TYPES = (
        GraphQLObjectType,
        GraphQLInterfaceType,
        GraphQLInputObjectType,
        GraphQLEnumType,
        GraphQLUnionType,
        GraphQLScalarType,
    )

    for type_name, type_obj in schema.type_map.items():
        if type_name.startswith("__") or not isinstance(
            type_obj,
            DIRECTIVE_RELATED_TYPES,
        ):
            continue

        # Directives on types
        if has_directives(type_obj):
            directive_strings = get_directive_strings(type_obj)
            if directive_strings:
                directive_map[type_name] = directive_strings

        # Directives on fields
        if isinstance(type_obj, GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType):
            for field_name, field in type_obj.fields.items():
                if has_directives(field):
                    directive_strings = get_directive_strings(field)
                    if directive_strings:
                        directive_map[(type_name, field_name)] = directive_strings

        # Directives on enums
        if isinstance(type_obj, GraphQLEnumType) and hasattr(type_obj, "values"):
            for enum_value_name, enum_value in type_obj.values.items():
                if has_directives(enum_value):
                    directive_strings = get_directive_strings(enum_value)
                    if directive_strings:
                        directive_map[(type_name, enum_value_name)] = directive_strings

    return directive_map


def add_directives_to_schema(schema_str: str, directive_map: dict[str | tuple[str, str], list[str]]) -> str:
    def find_first_unquoted_brace(line: str) -> int:
        """Find the first { that is not inside a string literal. Returns -1 if not found."""
        in_comment = False
        i = 0
        while i < len(line):
            if line[i] == '"' and (i == 0 or line[i - 1] != "\\"):
                in_comment = not in_comment
            elif line[i] == "{" and not in_comment:
                return i
            i += 1
        return -1

    lines = schema_str.split("\n")
    result_lines = []
    current_type = None

    for line in lines:
        type_match = re.match(GRAPHQL_TYPE_DEFINITION_PATTERN, line)
        if type_match:
            type_kind = type_match.group(1)
            type_name = type_match.group(2)
            current_type = type_name

            if type_name in directive_map:
                directives_str = " " + " ".join(directive_map[type_name])

                brace_pos = find_first_unquoted_brace(line)
                if brace_pos != -1:
                    line = line[:brace_pos].rstrip() + directives_str + " " + line[brace_pos:]
                else:
                    line = line.replace(f"{type_kind} {type_name}", f"{type_kind} {type_name}{directives_str}")

        elif current_type:
            field_match = re.match(r"^\s+(\w+)(?:\([^)]*\))?\s*:\s*", line)
            if field_match:
                field_name = field_match.group(1)
                if current_type and (current_type, field_name) in directive_map:
                    directives_str = " " + " ".join(directive_map[(current_type, field_name)])
                    line = line.rstrip() + directives_str

            enum_match = re.match(r"^\s+(\w+)\s*$", line)
            if enum_match:
                enum_value_name = enum_match.group(1)
                if current_type and (current_type, enum_value_name) in directive_map:
                    directives_str = " " + " ".join(directive_map[(current_type, enum_value_name)])
                    line = line.rstrip() + directives_str

        if line.strip() == "}":
            current_type = None

        result_lines.append(line)

    return "\n".join(result_lines)
