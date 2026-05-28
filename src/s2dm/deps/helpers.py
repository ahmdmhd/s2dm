from pathlib import Path

import yaml

from s2dm.deps.models import DependencyConfig, RemoteIdentityConfig
from s2dm.deps.resolve.common import DEFAULT_DEPS_CONFIG_FILENAME, DEFAULT_IDENTITY_FILENAME
from s2dm.deps.resolve.context import ResolverContext
from s2dm.deps.resolve.providers import RemoteIdentityProvider
from s2dm.deps.resolve.warnings import WarningCollector


def get_dependency_config_path(workspace: Path) -> Path:
    return workspace / DEFAULT_DEPS_CONFIG_FILENAME


def get_dependency_identity_path(workspace: Path) -> Path:
    return workspace / DEFAULT_IDENTITY_FILENAME


def load_dependency_config(path: Path) -> DependencyConfig:
    return DependencyConfig.load(path)


def save_dependency_config(config: DependencyConfig, path: Path) -> None:
    _save_yaml_payload(path, config.model_dump(mode="json"))


def load_dependency_identity_config(path: Path) -> RemoteIdentityConfig | None:
    if not path.exists():
        return None
    return RemoteIdentityConfig.load(path)


def save_dependency_identity_config(identity_config: RemoteIdentityConfig, path: Path) -> None:
    _save_yaml_payload(path, identity_config.model_dump(mode="json"))


def delete_dependency_identity_config(path: Path) -> None:
    path.unlink(missing_ok=True)


def build_resolver_context(
    identity_config: RemoteIdentityConfig | None,
    warning_collector: WarningCollector | None = None,
) -> ResolverContext:
    remote_identity_provider = None
    if identity_config is not None:
        remote_identity_provider = RemoteIdentityProvider(identity_config)
    return ResolverContext(
        remote_identity_provider=remote_identity_provider,
        warning_collector=warning_collector,
    )


def _save_yaml_payload(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(payload, sort_keys=False), encoding="utf-8")
