from dataclasses import dataclass


@dataclass(frozen=True)
class SchemaDefinition:
    """Schema content paired with a source label for conflict reporting."""

    content: str
    source_label: str


@dataclass(frozen=True)
class DirectiveDefinitionConflict:
    """GraphQL directive defined with incompatible definitions across schemas."""

    directive_name: str
    schema_source_labels: tuple[str, ...]


@dataclass(frozen=True)
class ScalarDefinitionConflict:
    """GraphQL scalar defined with incompatible definitions across schemas."""

    scalar_name: str
    schema_source_labels: tuple[str, ...]


@dataclass(frozen=True)
class EnumDefinitionConflict:
    """GraphQL enum defined with incompatible values or directives across schemas."""

    enum_name: str
    schema_source_labels: tuple[str, ...]


@dataclass(frozen=True)
class QueryFieldConflict:
    """GraphQL Query field defined incompatibly across schemas."""

    type_name: str
    field_name: str
    schema_source_labels: tuple[str, ...]
