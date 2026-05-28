"""Models for dependency resolution endpoints."""

from pydantic import BaseModel, Field

from s2dm.deps.models import DependencyEntry, RemoteIdentityEntry


class DependenciesConfig(BaseModel):
    """Stored dependency configuration payload."""

    dependencies: list[DependencyEntry] = Field(..., description="Dependency entries to resolve")


class DependenciesIdentities(BaseModel):
    """Stored dependency identity payload."""

    identities: list[RemoteIdentityEntry] = Field(..., description="Dependency identity entries")


class ResolveDependenciesRequest(BaseModel):
    """Request model for dependency resolution using stored configuration."""

    clean: bool = Field(default=False, description="Whether to clean the API dependency workspace before resolving")


class DependenciesApiResponse(BaseModel):
    """Success response model for dependency operations that need to return warnings."""

    warnings: list[str] = Field(description="Warnings collected during dependency resolution")
