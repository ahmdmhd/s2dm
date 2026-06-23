from graphql import DocumentNode, parse, print_ast
from graphql.language.ast import DirectiveDefinitionNode, Node, ScalarTypeDefinitionNode

from s2dm.deps.compose.models import (
    DirectiveDefinitionConflict,
    ScalarDefinitionConflict,
    SchemaDefinition,
)


class SharedDefinitionResolver:
    """Reconcile shared directive and scalar definitions across schema sources.

    Directives and scalars cannot be prefixed, so the resolver extracts them out of every schema,
    reports incompatible redeclarations as conflicts, and emits the reconciled set as a single block.
    Each schema is left with its type definitions only for downstream composition.
    """

    def __init__(self, schema_definitions: list[SchemaDefinition]) -> None:
        self.schema_documents = [
            (schema_definition.source_label, parse(schema_definition.content))
            for schema_definition in schema_definitions
        ]
        incompatible_definitions_items = self._incompatible_definitions().items()
        self.directive_conflicts = tuple(
            DirectiveDefinitionConflict(directive_name=name, schema_source_labels=schema_source_labels)
            for (kind, name), schema_source_labels in incompatible_definitions_items
            if kind == "directive"
        )
        self.scalar_conflicts = tuple(
            ScalarDefinitionConflict(scalar_name=name, schema_source_labels=schema_source_labels)
            for (kind, name), schema_source_labels in incompatible_definitions_items
            if kind == "scalar"
        )

    def resolved_definitions_sdl(self) -> str:
        """Return the reconciled directives and scalars as a single SDL block, each declared once.

        Keeps the first declaration of every ``(kind, name)`` in dependency order. Identical
        redeclarations collapse to that copy; incompatible ones are reported via ``directive_conflicts`` /
        ``scalar_conflicts`` and must block the build before this is written.
        """
        seen_keys: set[tuple[str, str]] = set()
        shared_definitions: list[Node] = []
        for _, document in self.schema_documents:
            for definition in document.definitions:
                shared_definition = self._as_shared_definition(definition)
                if shared_definition is None:
                    continue
                key, _ = shared_definition
                if key in seen_keys:
                    continue
                seen_keys.add(key)
                shared_definitions.append(definition)
        if not shared_definitions:
            return ""
        return print_ast(DocumentNode(definitions=tuple(shared_definitions)))

    def schema_definitions_without_shared_definitions(self) -> list[SchemaDefinition]:
        """Return each schema definition with its directive and scalar declarations removed."""
        type_only_schema_definitions: list[SchemaDefinition] = []
        for source_label, document in self.schema_documents:
            type_definitions = tuple(
                definition for definition in document.definitions if self._as_shared_definition(definition) is None
            )
            type_only_schema_definitions.append(
                SchemaDefinition(
                    content=print_ast(DocumentNode(definitions=type_definitions)),
                    source_label=source_label,
                )
            )
        return type_only_schema_definitions

    def conflict_messages(self) -> list[str]:
        """Return generic conflict messages for incompatible shared definitions."""
        messages: list[str] = []

        for directive_conflict in self.directive_conflicts:
            source_labels = ", ".join(directive_conflict.schema_source_labels)
            messages.append(
                f"Multiple definitions of directive `@{directive_conflict.directive_name}` found in [{source_labels}]"
            )

        for scalar_conflict in self.scalar_conflicts:
            source_labels = ", ".join(scalar_conflict.schema_source_labels)
            messages.append(
                f"Multiple definitions of scalar `{scalar_conflict.scalar_name}` found in [{source_labels}]"
            )

        return messages

    def _incompatible_definitions(self) -> dict[tuple[str, str], tuple[str, ...]]:
        source_labels_by_key: dict[tuple[str, str], list[str]] = {}
        identities_by_key: dict[tuple[str, str], set[tuple[object, ...]]] = {}
        for source_label, document in self.schema_documents:
            for definition in document.definitions:
                shared_definition = self._as_shared_definition(definition)
                if shared_definition is None:
                    continue
                key, identity = shared_definition
                source_labels_by_key.setdefault(key, []).append(source_label)
                identities_by_key.setdefault(key, set()).add(identity)
        return {
            key: tuple(schema_source_labels)
            for key, schema_source_labels in source_labels_by_key.items()
            if len(schema_source_labels) > 1 and len(identities_by_key[key]) > 1
        }

    @staticmethod
    def _as_shared_definition(definition: Node) -> tuple[tuple[str, str], tuple[object, ...]] | None:
        """Map a directive/scalar definition to its ``((kind, name), identity)``; ``None`` for anything else.

        Two schemas declaring the same ``(kind, name)`` must declare it identically: equal identity
        means the declarations are interchangeable and collapse to one; differing identity is a conflict.
        """
        if isinstance(definition, DirectiveDefinitionNode):
            return ("directive", definition.name.value), SharedDefinitionResolver._directive_identity(definition)
        if isinstance(definition, ScalarTypeDefinitionNode):
            return ("scalar", definition.name.value), SharedDefinitionResolver._scalar_identity(definition)
        return None

    @staticmethod
    def _directive_identity(node: DirectiveDefinitionNode) -> tuple[object, ...]:
        """Directive identity: its locations and argument definitions, compared order-insensitively."""
        locations = tuple(sorted(location.value for location in node.locations))
        arguments = tuple(sorted(print_ast(argument) for argument in node.arguments))
        return (locations, arguments, node.repeatable)

    @staticmethod
    def _scalar_identity(node: ScalarTypeDefinitionNode) -> tuple[object, ...]:
        """Scalar identity: the directives applied to it, compared order-insensitively."""
        return tuple(sorted(print_ast(directive) for directive in node.directives))
