"""Dependency resolution service for API endpoints."""

from pathlib import Path

from pydantic import ValidationError

from s2dm.api.config import get_api_workspace
from s2dm.api.errors import ResourceNotFoundError, ResponseError, format_error_list
from s2dm.api.models.base import ContentInput, PathInput
from s2dm.api.models.deps import (
    ApiDependencyEntry,
    DependenciesConfig,
    DependenciesIdentities,
    DependenciesStatusResponse,
)
from s2dm.deps.helpers import (
    build_resolver_context,
    delete_dependency_identity_config,
    get_dependency_config_path,
    get_dependency_identity_path,
    get_dependency_status,
    load_dependency_config,
    load_dependency_identity_config,
    load_vendored_dependency_schema_inputs,
    prepare_dependency_schemas_for_composition,
    resolve_dependency_config_to_lock_path,
    save_dependency_config,
    save_dependency_identity_config,
    validate_cached_dependency_workspace,
)
from s2dm.deps.models import DependencyConfig, DependencyEntry, RemoteIdentityConfig
from s2dm.deps.resolve.common import VENDOR_DIRECTORY
from s2dm.deps.resolve.errors import DependencyConfigError
from s2dm.deps.resolve.warnings import ListWarningCollector
from s2dm.exporters.utils.schema_loader import compose_schemas_to_string


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


def load_dependencies_status() -> DependenciesStatusResponse:
    """Evaluate dependency resolution status in the API-managed workspace."""
    status = get_dependency_status(get_api_workspace())
    return DependenciesStatusResponse(status=status)


def resolve_api_dependencies(clean: bool) -> list[str]:
    """Resolve dependencies in the API-managed workspace."""
    api_workspace = get_api_workspace()
    warnings: list[str] = []
    identity_config = load_dependency_identity_config(get_dependency_identity_path(api_workspace))
    resolver_context = build_resolver_context(identity_config, warning_collector=ListWarningCollector(warnings))
    dependency_config = _load_stored_dependency_config(api_workspace)

    resolve_dependency_config_to_lock_path(
        dependency_config,
        api_workspace,
        resolver_context,
        clean,
    )
    return warnings


def build_api_dependencies(auto_prefix: bool) -> str:
    """Compose vendored dependency schemas in the API-managed workspace."""
    api_workspace = get_api_workspace()
    dependency_config = _load_stored_dependency_config(api_workspace)
    validate_cached_dependency_workspace(dependency_config, api_workspace)
    vendor_root = api_workspace / VENDOR_DIRECTORY

    selected_schema_contents, dependency_schema_inputs = load_vendored_dependency_schema_inputs(
        dependency_config,
        vendor_root,
    )
    schema_paths, type_name_conflicts = prepare_dependency_schemas_for_composition(
        dependency_schema_inputs,
        selected_schema_contents,
        auto_prefix,
    )
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
    return compose_schemas_to_string(
        schemas=schema_paths,
        root_type=None,
        selection_query=None,
        naming_config=None,
        expanded_instances=False,
    )


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
