"""Models for dependency resolution endpoints."""

from pydantic import BaseModel, Field, field_validator

from s2dm.api.models.base import ConfigInput
from s2dm.deps.helpers import DependencyStatus
from s2dm.deps.models import RemoteIdentityEntry
from s2dm.deps.models.common import DependencyName, DependencyVersion, RequiredString
from s2dm.deps.models.deps_file import DependencySource, parse_dependency_source


class ApiDependencyEntry(BaseModel):
    """API payload for a single dependency entry."""

    name: DependencyName
    version: DependencyVersion
    source: DependencySource
    artifact: RequiredString
    selection: ConfigInput | None = None

    @field_validator("source", mode="before")
    @classmethod
    def validate_source(cls, value: object) -> object:
        """Route dependency source strings to the correct typed union member."""
        return parse_dependency_source(value)


class DependenciesConfig(BaseModel):
    """Stored dependency configuration payload."""

    dependencies: list[ApiDependencyEntry] = Field(..., description="Dependency entries to resolve")


class DependenciesIdentities(BaseModel):
    """Stored dependency identity payload."""

    identities: list[RemoteIdentityEntry] = Field(..., description="Dependency identity entries")


class ResolveDependenciesRequest(BaseModel):
    """Request model for dependency resolution using stored configuration."""

    clean: bool = Field(default=False, description="Whether to clean the API dependency workspace before resolving")


class BuildDependenciesRequest(BaseModel):
    """Request model for dependency build using stored configuration."""

    auto_prefix: bool = Field(
        default=False,
        description="Whether to prefix conflicting dependency types automatically during composition",
    )


class DependenciesApiResponse(BaseModel):
    """Success response model for dependency operations that need to return warnings."""

    warnings: list[str] = Field(description="Warnings collected during dependency resolution")


class DependenciesStatusResponse(BaseModel):
    """Minimal dependency status response."""

    status: DependencyStatus = Field(description="Current dependency resolution status")
