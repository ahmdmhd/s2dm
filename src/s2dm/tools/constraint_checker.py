from graphql import GraphQLEnumType, GraphQLObjectType, GraphQLSchema, get_named_type

from s2dm.constants.directive import Directive, DirectiveArgument
from s2dm.exporters.utils.directive import (
    get_directive_arguments,
    get_objects_with_multiple_fields_with_directive,
    has_given_directive,
)
from s2dm.exporters.utils.instance_tag import get_instance_tag_type, is_instance_tag_field
from s2dm.exporters.utils.naming_config import NamingConventionConfig
from s2dm.exporters.utils.violations import ConstraintCode, ConstraintViolation
from s2dm.tools.naming_checker import check_naming_conventions


class ConstraintChecker:
    def __init__(self, schema: GraphQLSchema, naming_config: NamingConventionConfig | None = None):
        self.schema = schema
        self.naming_config = naming_config

    def check_min_leq_max(self, objects: list[GraphQLObjectType], directive: Directive) -> list[ConstraintViolation]:
        violations: list[ConstraintViolation] = []
        for obj in objects:
            for fname, field in obj.fields.items():
                if has_given_directive(field, directive):
                    args = get_directive_arguments(field, directive)
                    try:
                        min_val = args.get(DirectiveArgument.MIN)
                        max_val = args.get(DirectiveArgument.MAX)
                        if min_val is not None and max_val is not None and float(min_val) > float(max_val):
                            violations.append(
                                ConstraintViolation(
                                    ConstraintCode.MIN_GREATER_THAN_MAX,
                                    f"[{directive.value}] {obj.name}.{fname} has min > max ({min_val} > {max_val})",
                                )
                            )
                    except (ValueError, TypeError) as exc:
                        violations.append(
                            ConstraintViolation(
                                ConstraintCode.INVALID_MIN_MAX,
                                f"[{directive.value}] {obj.name}.{fname} has invalid min/max values: {exc}",
                            )
                        )

        return violations

    def run(self, objects: list[GraphQLObjectType]) -> list[ConstraintViolation]:
        violations: list[ConstraintViolation] = []
        for obj in objects:
            for fname, field in obj.fields.items():
                if not is_instance_tag_field(field):
                    continue

                output_type = get_instance_tag_type(field, self.schema)
                if output_type is None:
                    violations.append(
                        ConstraintViolation(
                            ConstraintCode.INSTANCE_TAG_INVALID_REFERENCE,
                            f"[instanceTag] {obj.name}.{fname} must reference an object or enum type with @instanceTag",
                        )
                    )

        for obj_name, field_names in get_objects_with_multiple_fields_with_directive(
            objects, Directive.INSTANCE_TAG
        ).items():
            joined = ", ".join(field_names)
            violations.append(
                ConstraintViolation(
                    ConstraintCode.INSTANCE_TAG_MULTIPLE_FIELDS,
                    f"[instanceTag] {obj_name} must have at most one @instanceTag field (found: {joined})",
                )
            )

        for obj in objects:
            if has_given_directive(obj, Directive.INSTANCE_TAG):
                for fname, field in obj.fields.items():
                    field_type = get_named_type(field.type)
                    if not isinstance(field_type, GraphQLEnumType):
                        violations.append(
                            ConstraintViolation(
                                ConstraintCode.INSTANCE_TAG_NON_ENUM_FIELD,
                                f"[instanceTag] {obj.name}.{fname} must be an enum (in @instanceTag object)",
                            )
                        )

        violations += self.check_min_leq_max(objects, Directive.RANGE)
        violations += self.check_min_leq_max(objects, Directive.CARDINALITY)

        if self.naming_config:
            naming_errors = check_naming_conventions(self.schema, self.naming_config)
            violations += [ConstraintViolation(ConstraintCode.NAMING_CONVENTION, error) for error in naming_errors]

        return violations
