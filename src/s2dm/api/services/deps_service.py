"""Dependency resolution service for API endpoints."""

from contextlib import nullcontext
from pathlib import Path

from pydantic import ValidationError

from s2dm.api.config import get_api_workspace
from s2dm.api.errors import ResourceNotFoundError
from s2dm.api.models.deps import DependenciesConfig, DependenciesIdentities
from s2dm.deps import (
    DEPENDENCY_LOCK_FILENAME,
    clean_resolved_dependencies,
    resolve_dependencies,
)
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
from s2dm.deps.models import DependencyConfig, RemoteIdentityConfig
from s2dm.deps.resolve.errors import DependencyConfigError
from s2dm.deps.resolve.warnings import ListWarningCollector


def save_dependencies_config(config: DependenciesConfig) -> None:
    """Store dependency configuration in the API workspace."""
    api_workspace = get_api_workspace()
    dependency_config = _build_dependency_config(config)
    save_dependency_config(dependency_config, get_dependency_config_path(api_workspace))


def load_dependencies_config() -> DependenciesConfig:
    """Load stored dependency configuration from the API workspace."""
    api_workspace = get_api_workspace()
    config_path = get_dependency_config_path(api_workspace)
    if not config_path.exists():
        raise ResourceNotFoundError("Dependency config is not stored")

    dependency_config = load_dependency_config(config_path)
    return DependenciesConfig(dependencies=dependency_config.dependencies)


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


def _build_dependency_config(config: DependenciesConfig) -> DependencyConfig:
    try:
        return DependencyConfig(dependencies=config.dependencies)
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
    return load_dependency_config(config_path)
