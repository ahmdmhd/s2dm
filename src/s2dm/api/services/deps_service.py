"""Dependency resolution service for API endpoints."""

from contextlib import nullcontext
from pathlib import Path

from graphql import DocumentNode, parse
from pydantic import ValidationError

from s2dm.api.config import get_api_workspace
from s2dm.api.errors import ResourceNotFoundError, ResponseError, format_error_list
from s2dm.api.models.base import ContentInput, PathInput
from s2dm.api.models.deps import ApiDependencyEntry, DependenciesConfig, DependenciesIdentities
from s2dm.deps import (
    DEPENDENCY_LOCK_FILENAME,
    clean_resolved_dependencies,
    resolve_dependencies,
)
from s2dm.deps.compose import DependencySchemaBuilder, DependencySchemaInput
from s2dm.deps.helpers import (
    build_resolver_context,
    delete_dependency_identity_config,
    get_dependency_config_path,
    get_dependency_identity_path,
    load_dependency_config,
    load_dependency_identity_config,
    save_dependency_config,
    save_dependency_identity_config,
)
from s2dm.deps.models import DependencyConfig, DependencyEntry, DependencyMetadata, RemoteIdentityConfig
from s2dm.deps.resolve.common import METADATA_FILENAME, SCHEMA_FILENAME, VENDOR_DIRECTORY
from s2dm.deps.resolve.errors import DependencyConfigError
from s2dm.deps.resolve.warnings import ListWarningCollector
from s2dm.exporters.utils.schema_loader import (
    build_schema_str_with_optional_source_map,
    check_correct_schema,
    load_schema_with_source_map,
    print_schema_with_directives_preserved,
    process_schema,
)
from s2dm.utils.file import temp_files_from_contents


def save_dependencies_config(config: DependenciesConfig) -> None:
    """Store dependency configuration in the API workspace."""
    api_workspace = get_api_workspace()
    dependency_config = _build_dependency_config(config, api_workspace)
    save_dependency_config(dependency_config, get_dependency_config_path(api_workspace))


def load_dependencies_config() -> DependenciesConfig:
    """Load stored dependency configuration from the API workspace."""
    api_workspace = get_api_workspace()
    config_path = get_dependency_config_path(api_workspace)
    if not config_path.exists():
        raise ResourceNotFoundError("Dependency config is not stored")

    dependency_config = _load_dependency_config_file(config_path)
    selections_directory = _get_api_selection_directory(api_workspace)

    try:
        return DependenciesConfig(
            dependencies=[
                _build_api_dependency_entry(dependency_entry, selections_directory)
                for dependency_entry in dependency_config.dependencies
            ]
        )
    except (OSError, ValidationError, ValueError) as error:
        raise DependencyConfigError(str(error)) from error


def save_dependencies_identities(identities: DependenciesIdentities) -> None:
    """Store dependency identities in the API workspace."""
    api_workspace = get_api_workspace()
    remote_identity_config = _build_remote_identity_config(identities)
    save_dependency_identity_config(remote_identity_config, get_dependency_identity_path(api_workspace))


def load_dependencies_identities() -> DependenciesIdentities:
    """Load stored dependency identities from the API workspace."""
    api_workspace = get_api_workspace()
    identity_path = get_dependency_identity_path(api_workspace)
    identity_config = load_dependency_identity_config(identity_path)
    if identity_config is None:
        raise ResourceNotFoundError("Dependency identities are not stored")

    return DependenciesIdentities(identities=identity_config.identities)


def delete_dependencies_identities() -> None:
    """Delete stored dependency identities from the API workspace if present."""
    delete_dependency_identity_config(get_dependency_identity_path(get_api_workspace()))


def resolve_api_dependencies(clean: bool) -> list[str]:
    """Resolve dependencies in the API-managed workspace."""
    api_workspace = get_api_workspace()
    warnings: list[str] = []
    identity_config = load_dependency_identity_config(get_dependency_identity_path(api_workspace))
    resolver_context = build_resolver_context(identity_config, warning_collector=ListWarningCollector(warnings))
    clean_context = clean_resolved_dependencies(api_workspace) if clean else nullcontext()
    dependency_config = _load_stored_dependency_config(api_workspace)

    with clean_context:
        lock_file = resolve_dependencies(dependency_config, api_workspace, resolver_context)

    lock_path = api_workspace / DEPENDENCY_LOCK_FILENAME
    lock_file.save(lock_path)
    return warnings


def build_api_dependencies(auto_prefix: bool) -> str:
    """Compose vendored dependency schemas in the API-managed workspace."""
    api_workspace = get_api_workspace()
    dependency_config = _load_stored_dependency_config(api_workspace)
    vendor_root = api_workspace / VENDOR_DIRECTORY

    selected_schema_contents, dependency_schema_contents = _load_dependency_schema_inputs(
        dependency_config=dependency_config,
        vendor_root=vendor_root,
    )

    if not selected_schema_contents:
        raise ResponseError(f"No vendored dependency schemas found under {vendor_root}")

    dependency_schema_builder = DependencySchemaBuilder(dependency_schema_contents)
    type_name_conflicts = dependency_schema_builder.find_conflicts()
    if type_name_conflicts and not auto_prefix:
        conflict_messages = [
            "Multiple "
            f"`{conflict.type_name}` types found in "
            f"[{', '.join(f'{dependency.name}@{dependency.version}' for dependency in conflict.dependencies_metadata)}]"
            for conflict in type_name_conflicts
        ]
        raise ResponseError(
            format_error_list("Dependency build failed due to conflicting type definitions", conflict_messages)
        )

    schema_paths = (
        dependency_schema_builder.write_auto_prefixed_schema_files()
        if auto_prefix
        else temp_files_from_contents(selected_schema_contents)
    )
    return _compose_dependency_schemas(schema_paths)


def _build_dependency_config(config: DependenciesConfig, api_workspace: Path) -> DependencyConfig:
    selections_directory = _get_api_selection_directory(api_workspace)
    try:
        return DependencyConfig(
            dependencies=[
                _build_dependency_entry(dependency_entry, selections_directory)
                for dependency_entry in config.dependencies
            ]
        )
    except ValidationError as error:
        raise DependencyConfigError(str(error)) from error


def _build_remote_identity_config(identities: DependenciesIdentities) -> RemoteIdentityConfig:
    try:
        return RemoteIdentityConfig(identities=identities.identities)
    except ValidationError as error:
        raise DependencyConfigError(str(error)) from error


def _load_stored_dependency_config(api_workspace: Path) -> DependencyConfig:
    config_path = get_dependency_config_path(api_workspace)
    if not config_path.exists():
        raise ResourceNotFoundError("Dependency config is not stored")
    return _load_dependency_config_file(config_path)


def _load_dependency_config_file(config_path: Path) -> DependencyConfig:
    try:
        return load_dependency_config(config_path)
    except ValidationError as error:
        raise DependencyConfigError(str(error)) from error


def _build_dependency_entry(
    dependency_entry: ApiDependencyEntry,
    selections_directory: Path,
) -> DependencyEntry:
    return DependencyEntry(
        name=dependency_entry.name,
        version=dependency_entry.version,
        source=dependency_entry.source,
        artifact=dependency_entry.artifact,
        selection=_resolve_selection_path(
            dependency_entry.selection,
            dependency_entry.name,
            dependency_entry.version,
            selections_directory,
        ),
    )


def _build_api_dependency_entry(
    dependency_entry: DependencyEntry,
    selections_directory: Path,
) -> ApiDependencyEntry:
    return ApiDependencyEntry(
        name=dependency_entry.name,
        version=dependency_entry.version,
        source=dependency_entry.source,
        artifact=dependency_entry.artifact,
        selection=_build_api_selection_input(dependency_entry.selection, selections_directory),
    )


def _resolve_selection_path(
    selection: PathInput | ContentInput | None,
    dependency_name: str,
    dependency_version: str,
    selections_directory: Path,
) -> Path | None:
    if selection is None:
        return None
    if selection.type == "path":
        return Path(selection.path)

    selections_directory.mkdir(parents=True, exist_ok=True)
    selection_path = selections_directory / f"{dependency_name}-{dependency_version}.graphql"
    selection_path.write_text(selection.content, encoding="utf-8")
    return selection_path


def _build_api_selection_input(
    selection_path: Path | None,
    selections_directory: Path,
) -> PathInput | ContentInput | None:
    if selection_path is None:
        return None

    resolved_selection_path = selection_path.resolve()
    if not resolved_selection_path.is_file():
        raise ValueError(f"Dependency selection file does not exist: {resolved_selection_path}")

    if resolved_selection_path.is_relative_to(selections_directory.resolve()):
        return ContentInput(type="content", content=resolved_selection_path.read_text(encoding="utf-8"))
    return PathInput(type="path", path=resolved_selection_path)


def _get_api_selection_directory(api_workspace: Path) -> Path:
    return api_workspace / "selections"


def _load_dependency_schema_inputs(
    dependency_config: DependencyConfig,
    vendor_root: Path,
) -> tuple[list[str], list[DependencySchemaInput]]:
    selected_schema_contents: list[str] = []
    dependency_schema_contents: list[DependencySchemaInput] = []
    selection_by_schema_path: dict[Path, DocumentNode] = {}

    def resolve_schema_selection(schema_path: Path) -> DocumentNode | None:
        return selection_by_schema_path.get(schema_path.resolve())

    for dependency in dependency_config.dependencies:
        dependency_vendor_directory = vendor_root / dependency.name / dependency.version
        schema_path = dependency_vendor_directory / SCHEMA_FILENAME
        metadata_path = dependency_vendor_directory / METADATA_FILENAME

        if not schema_path.is_file():
            raise ResponseError(f"Vendored dependency schema does not exist: {schema_path}")
        if not metadata_path.is_file():
            raise ResponseError(f"Vendored dependency metadata does not exist: {metadata_path}")

        resolved_schema_path = schema_path.resolve()
        if dependency.selection is not None:
            selection_by_schema_path[resolved_schema_path] = parse(dependency.selection.read_text(encoding="utf-8"))

        schema_content, _ = build_schema_str_with_optional_source_map(
            [resolved_schema_path],
            schema_selection_resolver=resolve_schema_selection,
        )
        selected_schema_contents.append(schema_content)
        dependency_schema_contents.append(
            DependencySchemaInput(
                schema_content=schema_content,
                metadata=DependencyMetadata.load(metadata_path),
            )
        )

    return selected_schema_contents, dependency_schema_contents


def _compose_dependency_schemas(schema_paths: list[Path]) -> str:
    graphql_schema, source_map = load_schema_with_source_map(schema_paths)
    schema_errors = check_correct_schema(graphql_schema)
    if schema_errors:
        raise ResponseError(format_error_list("Schema validation failed", schema_errors))

    annotated_schema = process_schema(
        schema=graphql_schema,
        source_map=source_map,
        naming_config=None,
        query_document=None,
        root_type=None,
        expanded_instances=False,
    )
    return print_schema_with_directives_preserved(annotated_schema.schema, source_map)
