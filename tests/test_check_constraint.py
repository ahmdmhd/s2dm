from graphql import GraphQLObjectType, GraphQLSchema, build_schema

from s2dm.exporters.utils.extraction import get_all_object_types
from s2dm.exporters.utils.violations import ConstraintCode
from s2dm.tools.constraint_checker import ConstraintChecker


def make_schema(sdl: str) -> GraphQLSchema:
    schema = build_schema(sdl)
    return schema


def get_objects(schema: GraphQLSchema) -> list[GraphQLObjectType]:
    return get_all_object_types(schema)


def test_instance_tag_field_must_reference_instance_tag_object() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM

    type TagObj @instanceTag {
      level: TagEnum
    }
    enum TagEnum { A B }

    type Foo {
      tag: TagObj @instanceTag
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert not violations


def test_instance_tag_field_wrong_type() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM

    type NotTagObj {
      foo: String
    }

    type Foo {
      tag: NotTagObj @instanceTag
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert any(violation.code == ConstraintCode.INSTANCE_TAG_INVALID_REFERENCE for violation in violations)


def test_instance_tag_object_fields_must_be_enum() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM

    type TagObj @instanceTag {
      notEnum: String
    }

    type Foo {
      tag: TagObj @instanceTag
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert any(violation.code == ConstraintCode.INSTANCE_TAG_NON_ENUM_FIELD for violation in violations)


def test_instance_tag_at_most_one_field_per_type() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM

    type TagObj @instanceTag {
      level: TagEnum
    }
    enum TagEnum { A B }

    type Foo {
      tag1: TagObj @instanceTag
      tag2: TagObj @instanceTag
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert any(violation.code == ConstraintCode.INSTANCE_TAG_MULTIPLE_FIELDS for violation in violations)


def test_instance_tag_single_field_is_allowed() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM

    type TagObj @instanceTag {
      level: TagEnum
    }
    enum TagEnum { A B }

    type Foo {
      tag: TagObj @instanceTag
      other: String
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert not violations


def test_instance_tag_field_may_reference_instance_tag_enum() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM | ENUM

    enum TagEnum @instanceTag {
      A
      B
    }

    type Foo {
      tag: TagEnum @instanceTag
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert not violations


def test_instance_tag_field_referencing_plain_enum_is_invalid() -> None:
    sdl = """
    directive @instanceTag(exclude: [String!]) on OBJECT | FIELD_DEFINITION | ENUM | ENUM

    enum TagEnum {
      A
      B
    }

    type Foo {
      tag: TagEnum @instanceTag
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert any(violation.code == ConstraintCode.INSTANCE_TAG_INVALID_REFERENCE for violation in violations)


def test_range_min_leq_max() -> None:
    sdl = """
    directive @range(min: Float, max: Float) on FIELD_DEFINITION

    type Foo {
      bar: Int @range(min: 0, max: 10)
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert not violations


def test_range_min_gt_max() -> None:
    sdl = """
    directive @range(min: Float, max: Float) on FIELD_DEFINITION

    type Foo {
      bar: Int @range(min: 10, max: 5)
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert any(violation.code == ConstraintCode.MIN_GREATER_THAN_MAX for violation in violations)


def test_cardinality_min_leq_max() -> None:
    sdl = """
    directive @cardinality(min: Int, max: Int) on FIELD_DEFINITION

    type Foo {
      bar: Int @cardinality(min: 0, max: 2)
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert not violations


def test_cardinality_min_gt_max() -> None:
    sdl = """
    directive @cardinality(min: Int, max: Int) on FIELD_DEFINITION

    type Foo {
      bar: Int @cardinality(min: 3, max: 2)
    }
    """
    schema = make_schema(sdl)
    objects = get_objects(schema)
    checker = ConstraintChecker(schema)
    violations = checker.run(objects)
    assert any(violation.code == ConstraintCode.MIN_GREATER_THAN_MAX for violation in violations)
