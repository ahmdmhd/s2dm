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


def _resolver(body_schema: str, powertrain_schema: str) -> SharedDefinitionResolver:
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
        ]
    )
