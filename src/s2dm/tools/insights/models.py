"""Shared result types for schema insights analysis, reused by both the CLI and the API layer."""

from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["warning", "info"]
ContainerKind = Literal["object", "interface", "input"]


class ConceptCounts(BaseModel):
    """Type counts by GraphQL concept kind."""

    object: int = Field(description="Number of object types")
    interface: int = Field(description="Number of interface types")
    enum: int = Field(description="Number of enum types")
    union: int = Field(description="Number of union types")
    scalar: int = Field(description="Number of custom scalar types")
    input: int = Field(description="Number of input object types")
    field: int = Field(description="Number of fields across all container types (objects, interfaces, inputs)")
    leaf_field: int = Field(description="Number of fields whose output type is a scalar or enum")
    relationship_field: int = Field(description="Number of fields whose output type is an object, interface, or union")
    directive: int = Field(description="Number of custom directive definitions")


class ConceptMembers(BaseModel):
    """Type names grouped by GraphQL concept kind."""

    object: list[str]
    interface: list[str]
    enum: list[str]
    union: list[str]
    scalar: list[str]
    input: list[str]
    directive: list[str] = Field(description="Custom directive names, prefixed with '@'")


class FieldInfo(BaseModel):
    """A field with its output type and whether it references another type."""

    name: str
    type: str = Field(description="Rendered output type reference, e.g. 'Float', '[Seat]', 'Vehicle!'")
    is_relationship: bool = Field(description="True when the output type is a composite type, not a scalar or enum")


class TypeFields(BaseModel):
    """A field container type and its fields."""

    type: str
    kind: ContainerKind
    fields: list[FieldInfo]


class EnumValueCount(BaseModel):
    """An enum type and the number of values it declares."""

    name: str
    values: int


class ScalarUsage(BaseModel):
    """How often a scalar type is used as a field's output type across all container types."""

    name: str
    count: int = Field(description="Number of container-type fields whose named output type is this scalar")
    is_builtin: bool = Field(description="True for the built-in scalars (String, Int, Float, Boolean, ID)")


class EnumUsage(BaseModel):
    """How often an enum type is used as a field's output type across all container types."""

    name: str
    count: int = Field(description="Number of container-type fields whose named output type is this enum")


class ConceptsResult(BaseModel):
    """Concept counts, member names, container-type field composition, and enum value counts."""

    counts: ConceptCounts
    members: ConceptMembers
    fields_by_type: list[TypeFields] = Field(
        description="Container types with their fields, sorted by field count descending",
    )
    enum_value_counts: list[EnumValueCount] = Field(
        description="Enum types with their value counts, sorted by value count descending",
    )
    scalar_usage: list[ScalarUsage] = Field(
        description="Scalar types with their field-usage counts, sorted by count descending then name",
    )
    enum_usage: list[EnumUsage] = Field(
        description="Enum types used as a field's output type, with usage counts, sorted by count descending then name",
    )


class PathSegment(BaseModel):
    """One object type in a reference path, with the field that leads into it."""

    type: str
    field: str | None = Field(
        default=None,
        description="Field on the preceding type that resolves to this type; None for the root",
    )
    field_type: str | None = Field(
        default=None,
        description="GraphQL type notation of that field, e.g. '[Seat!]!'; None for the root",
    )

    @property
    def label(self) -> str:
        """Human-readable segment, e.g. 'Vehicle' for the root or 'seats: [Seat!]!' for a hop."""
        if self.field is None:
            return self.type
        return f"{self.field}: {self.field_type}"


class RelationshipPath(BaseModel):
    """A chain of object types connected by field references."""

    segments: list[PathSegment]
    depth: int = Field(description="Number of hops (edges) in the path, equal to len(segments) - 1")


class DepthCount(BaseModel):
    """The number of paths that share a given depth."""

    depth: int
    count: int


class CyclicReference(BaseModel):
    """A reference loop where following object-type fields returns to a type already in the chain."""

    segments: list[PathSegment] = Field(
        description="The loop's segments, starting and ending at the same type, e.g. A -> b: B -> a: A",
    )
    length: int = Field(description="Number of hops (edges) around the loop, equal to len(segments) - 1")


class ReferenceCount(BaseModel):
    """How often a type is referenced across the schema."""

    name: str
    count: int = Field(description="Number of references to this type")


class RelationshipsResult(BaseModel):
    """Deepest object-reference paths reachable from the schema's root."""

    paths: list[RelationshipPath] = Field(
        description="All multi-hop reference paths, ordered deepest depth first",
    )
    max_depth: RelationshipPath | None
    total_paths: int = Field(description="Total number of unique reference paths across all depths")
    depth_distribution: list[DepthCount] = Field(
        description="Number of paths at each depth, sorted by depth ascending",
    )
    cyclic_references: list[CyclicReference] = Field(
        description="Deduplicated reference loops, each canonicalized to its smallest type, sorted by length ascending",
    )
    reference_counts: list[ReferenceCount] = Field(
        description="Types referenced at least once, sorted by count descending then name",
    )


class CoverageCount(BaseModel):
    """Documented versus total counts for a coverage category."""

    documented: int
    total: int


class CoverageBreakdown(BaseModel):
    """Documentation coverage counts by category."""

    types: CoverageCount = Field(
        description="Objects, interfaces, input objects, unions, and custom scalars",
    )
    fields: CoverageCount = Field(description="Fields declared on container types")
    enums: CoverageCount
    enum_values: CoverageCount
    directives: CoverageCount = Field(description="Custom directive definitions")


class UndocumentedEntity(BaseModel):
    """A type, field, or enum value missing a description."""

    name: str
    kind: str


class CoverageResult(BaseModel):
    """Documentation coverage across container types, fields, enums, and enum values."""

    breakdown: CoverageBreakdown
    undocumented: list[UndocumentedEntity]


class QualityIssue(BaseModel):
    """A single quality issue found in the schema."""

    target: str
    problem: str
    severity: Severity
    category: str


class QualityResult(BaseModel):
    """Quality issues found in the schema: missing descriptions, deprecated fields, unused enums."""

    issues: list[QualityIssue]


class InsightsBundle(BaseModel):
    """Full insight result payload used by static consumers."""

    concepts: ConceptsResult
    relationships: RelationshipsResult
    coverage: CoverageResult
    quality: QualityResult
