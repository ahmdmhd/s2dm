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
