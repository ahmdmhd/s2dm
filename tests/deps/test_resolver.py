from graphql import parse
from graphql.language.ast import EnumTypeDefinitionNode

from s2dm.deps.compose import SchemaDefinition, SharedDefinitionResolver


def test_identical_directives_are_not_a_conflict() -> None:
    resolver = _resolver(
        "directive @meta(note: String) on FIELD_DEFINITION\n",
        "directive @meta(note: String) on FIELD_DEFINITION\n",
    )

    assert resolver.directive_conflicts == ()


def test_directive_locations_are_compared_order_insensitively() -> None:
    resolver = _resolver(
        "directive @meta on OBJECT | FIELD_DEFINITION\n",
        "directive @meta on FIELD_DEFINITION | OBJECT\n",
    )

    assert resolver.directive_conflicts == ()


def test_incompatible_directive_locations_are_a_conflict() -> None:
    resolver = _resolver(
        "directive @meta on FIELD_DEFINITION\n",
        "directive @meta on OBJECT\n",
    )

    (conflict,) = resolver.directive_conflicts

    assert conflict.directive_name == "meta"
    assert set(conflict.schema_source_labels) == {"BodyModel@1.0.0", "PowertrainModel@2.0.0"}


def test_incompatible_directive_arguments_are_a_conflict() -> None:
    resolver = _resolver(
        "directive @meta(note: String) on FIELD_DEFINITION\n",
        "directive @meta(note: Int) on FIELD_DEFINITION\n",
    )

    (conflict,) = resolver.directive_conflicts

    assert conflict.directive_name == "meta"


def test_directive_superset_conflicts_without_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @meta(note: String) on FIELD_DEFINITION
        """,
        """
        directive @meta(note: String, source: String) on FIELD_DEFINITION | OBJECT
        """,
    )

    (conflict,) = resolver.directive_conflicts

    assert conflict.directive_name == "meta"


def test_directive_superset_is_selected_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @meta(note: String) on FIELD_DEFINITION
        """,
        """
        directive @meta(note: String, source: String) on FIELD_DEFINITION | OBJECT
        """,
        merge_shared_definitions=True,
    )

    resolved_definitions_sdl = resolver.resolved_definitions_sdl()

    assert resolver.directive_conflicts == ()
    assert "directive @meta(note: String, source: String) on FIELD_DEFINITION | OBJECT" in resolved_definitions_sdl


def test_identical_scalars_are_not_a_conflict() -> None:
    resolver = _resolver("scalar DateTime\n", "scalar DateTime\n")

    assert resolver.scalar_conflicts == ()


def test_incompatible_scalars_are_a_conflict() -> None:
    resolver = _resolver(
        'scalar DateTime @specifiedBy(url: "https://example.com/a")\n',
        'scalar DateTime @specifiedBy(url: "https://example.com/b")\n',
    )

    (conflict,) = resolver.scalar_conflicts

    assert conflict.scalar_name == "DateTime"
    assert set(conflict.schema_source_labels) == {"BodyModel@1.0.0", "PowertrainModel@2.0.0"}


def test_scalar_applied_directive_superset_is_selected_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @format(value: String!) on SCALAR
        scalar DateTime @format(value: "iso")
        """,
        """
        directive @format(value: String!, source: String) on SCALAR
        scalar DateTime @format(value: "iso", source: "system")
        """,
        merge_shared_definitions=True,
    )

    resolved_definitions_sdl = resolver.resolved_definitions_sdl()

    assert resolver.scalar_conflicts == ()
    assert "directive @format(value: String!, source: String) on SCALAR" in resolved_definitions_sdl
    assert 'scalar DateTime @format(value: "iso", source: "system")' in resolved_definitions_sdl


def test_scalar_applied_directive_argument_value_mismatch_conflicts_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @format(value: String!) on SCALAR
        scalar DateTime @format(value: "iso")
        """,
        """
        directive @format(value: String!) on SCALAR
        scalar DateTime @format(value: "epoch")
        """,
        merge_shared_definitions=True,
    )

    (conflict,) = resolver.scalar_conflicts

    assert conflict.scalar_name == "DateTime"


def test_identical_enums_are_not_a_conflict() -> None:
    resolver = _resolver(
        "enum Drivetrain { FWD RWD AWD }\n",
        "enum Drivetrain { FWD RWD AWD }\n",
    )

    assert resolver.enum_conflicts == ()


def test_enum_values_are_compared_order_insensitively() -> None:
    resolver = _resolver(
        "enum Drivetrain { FWD RWD AWD }\n",
        "enum Drivetrain { AWD FWD RWD }\n",
    )

    assert resolver.enum_conflicts == ()


def test_incompatible_enum_values_are_a_conflict() -> None:
    resolver = _resolver(
        "enum Drivetrain { FWD RWD }\n",
        "enum Drivetrain { FWD AWD }\n",
    )

    (conflict,) = resolver.enum_conflicts

    assert conflict.enum_name == "Drivetrain"
    assert set(conflict.schema_source_labels) == {"BodyModel@1.0.0", "PowertrainModel@2.0.0"}


def test_enum_value_superset_conflicts_without_merge_shared_definitions() -> None:
    resolver = _resolver(
        "enum Drivetrain { FWD RWD }\n",
        "enum Drivetrain { FWD RWD AWD }\n",
    )

    (conflict,) = resolver.enum_conflicts

    assert conflict.enum_name == "Drivetrain"


def test_enum_value_superset_is_selected_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        "enum Drivetrain { FWD RWD }\n",
        "enum Drivetrain { FWD RWD AWD }\n",
        merge_shared_definitions=True,
    )

    document = parse(resolver.resolved_definitions_sdl())
    (drivetrain,) = [
        definition
        for definition in document.definitions
        if isinstance(definition, EnumTypeDefinitionNode) and definition.name.value == "Drivetrain"
    ]

    assert resolver.enum_conflicts == ()
    assert {value.name.value for value in drivetrain.values} == {"FWD", "RWD", "AWD"}


def test_enum_directive_superset_is_selected_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @meta(note: String, source: String) on ENUM
        enum Drivetrain @meta(note: "x") { FWD RWD }
        """,
        """
        directive @meta(note: String, source: String) on ENUM
        enum Drivetrain @meta(note: "x", source: "y") { FWD RWD }
        """,
        merge_shared_definitions=True,
    )

    resolved_definitions_sdl = resolver.resolved_definitions_sdl()

    assert resolver.enum_conflicts == ()
    assert '@meta(note: "x", source: "y")' in resolved_definitions_sdl


def test_enum_value_directive_superset_is_selected_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        "enum Drivetrain { FWD RWD }\n",
        'enum Drivetrain { FWD RWD @deprecated(reason: "legacy") }\n',
        merge_shared_definitions=True,
    )

    resolved_definitions_sdl = resolver.resolved_definitions_sdl()

    assert resolver.enum_conflicts == ()
    assert '@deprecated(reason: "legacy")' in resolved_definitions_sdl


def test_enum_value_directive_argument_superset_is_selected_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @meta(note: String, source: String) on ENUM_VALUE
        enum Drivetrain { FWD RWD @meta(note: "x") }
        """,
        """
        directive @meta(note: String, source: String) on ENUM_VALUE
        enum Drivetrain { FWD RWD @meta(note: "x", source: "y") }
        """,
        merge_shared_definitions=True,
    )

    resolved_definitions_sdl = resolver.resolved_definitions_sdl()

    assert resolver.enum_conflicts == ()
    assert '@meta(note: "x", source: "y")' in resolved_definitions_sdl


def test_enum_value_directive_argument_value_mismatch_conflicts_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @meta(note: String) on ENUM_VALUE
        enum Drivetrain { FWD RWD @meta(note: "x") }
        """,
        """
        directive @meta(note: String) on ENUM_VALUE
        enum Drivetrain { FWD RWD @meta(note: "z") }
        """,
        merge_shared_definitions=True,
    )

    (conflict,) = resolver.enum_conflicts

    assert conflict.enum_name == "Drivetrain"


def test_enum_value_directive_disjoint_arguments_conflict_with_merge_shared_definitions() -> None:
    resolver = _resolver(
        """
        directive @meta(note: String, source: String) on ENUM_VALUE
        enum Drivetrain { FWD RWD @meta(note: "x") }
        """,
        """
        directive @meta(note: String, source: String) on ENUM_VALUE
        enum Drivetrain { FWD RWD @meta(source: "y") }
        """,
        merge_shared_definitions=True,
    )

    (conflict,) = resolver.enum_conflicts

    assert conflict.enum_name == "Drivetrain"


def _resolver(
    body_schema: str,
    powertrain_schema: str,
    merge_shared_definitions: bool = False,
) -> SharedDefinitionResolver:
    return SharedDefinitionResolver(
        [
            SchemaDefinition(
                content=body_schema,
                source_label="BodyModel@1.0.0",
            ),
            SchemaDefinition(
                content=powertrain_schema,
                source_label="PowertrainModel@2.0.0",
            ),
        ],
        merge_shared_definitions=merge_shared_definitions,
    )
