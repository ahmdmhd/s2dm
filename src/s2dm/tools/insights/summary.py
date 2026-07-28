"""Compact summary builders for insights CLI output."""

from s2dm.tools.insights.models import ConceptCounts, ConceptsResult, CoverageResult, QualityResult, RelationshipsResult

_UNUSED_CATEGORY_GROUPS: list[tuple[str, str, tuple[str, ...], tuple[str, ...]]] = [
    (
        "Types",
        "types",
        (
            "Unused object types",
            "Unused interfaces",
            "Unused unions",
            "Unused input types",
            "Unused scalars",
        ),
        ("object", "interface", "union", "input", "scalar"),
    ),
    ("Enums", "enums", ("Unused enums",), ("enum",)),
    ("Directives", "directives", ("Unused directives",), ("directive",)),
]


def _median(values: list[int]) -> float:
    if not values:
        return 0.0
    sorted_values = sorted(values)
    middle = len(sorted_values) // 2
    if len(sorted_values) % 2 == 0:
        return (sorted_values[middle - 1] + sorted_values[middle]) / 2
    return float(sorted_values[middle])


def _rounded_percent(documented: int, total: int) -> int:
    if total == 0:
        return 0
    return int((documented / total) * 100 + 0.5)


def _count_issues(quality: QualityResult, categories: tuple[str, ...]) -> int:
    category_set = set(categories)
    return sum(1 for issue in quality.issues if issue.category in category_set)


def _unused_percentage(unused: int, total: int) -> int:
    return _rounded_percent(unused, total)


def _coverage_summary(coverage: CoverageResult) -> dict[str, dict[str, int]]:
    breakdown = coverage.breakdown
    categories = [
        ("types", breakdown.types.documented, breakdown.types.total),
        ("fields", breakdown.fields.documented, breakdown.fields.total),
        ("enums", breakdown.enums.documented, breakdown.enums.total),
        ("enum_values", breakdown.enum_values.documented, breakdown.enum_values.total),
        ("directives", breakdown.directives.documented, breakdown.directives.total),
    ]
    return {
        label: {
            "total": total,
            "documented": documented,
            "undocumented": total - documented,
            "percentage": _rounded_percent(documented, total),
        }
        for label, documented, total in categories
    }


def _unused_summary(quality: QualityResult, counts: ConceptCounts) -> dict[str, object]:
    count_lookup = counts.model_dump()
    category_summaries: dict[str, dict[str, int]] = {}
    total_unused = 0
    total_elements = 0
    for _, key, categories, count_keys in _UNUSED_CATEGORY_GROUPS:
        unused = _count_issues(quality, categories)
        total = sum(int(count_lookup[key]) for key in count_keys)
        total_unused += unused
        total_elements += total
        category_summaries[key] = {
            "total": total,
            "used": total - unused,
            "unused": unused,
            "percentage": _unused_percentage(unused, total),
        }

    return {
        "total": total_elements,
        "used": total_elements - total_unused,
        "unused": total_unused,
        "percentage": _unused_percentage(total_unused, total_elements),
        "categories": category_summaries,
    }


def build_concepts_summary(concepts: ConceptsResult, quality: QualityResult) -> dict[str, object]:
    enum_values = [entry.values for entry in concepts.enum_value_counts]
    scalar_count = len(concepts.scalar_usage)
    builtin_count = sum(1 for entry in concepts.scalar_usage if entry.is_builtin)
    used_enum_count = len(concepts.enum_usage)
    unused_enum_count = _count_issues(quality, ("Unused enums",))

    return {
        "field_container_types": {
            "total": concepts.counts.object + concepts.counts.interface + concepts.counts.input,
            "object_types": concepts.counts.object,
            "interface_types": concepts.counts.interface,
            "input_types": concepts.counts.input,
        },
        "fields": {
            "total": concepts.counts.field,
            "leaf_fields": concepts.counts.leaf_field,
            "relationship_fields": concepts.counts.relationship_field,
        },
        "enums": {
            "total": concepts.counts.enum,
            "enum_values": sum(enum_values),
            "median_values_per_enum": _median(enum_values),
        },
        "scalars": {
            "total": scalar_count,
            "built_in": builtin_count,
            "custom": scalar_count - builtin_count,
        },
        "enum_usage": {
            "used": used_enum_count,
            "unused": unused_enum_count,
            "total": used_enum_count + unused_enum_count,
        },
    }


def build_relationships_summary(relationships: RelationshipsResult, quality: QualityResult) -> dict[str, object]:
    max_depth = relationships.max_depth.depth if relationships.max_depth is not None else 0
    deepest_count = next(
        (entry.count for entry in relationships.depth_distribution if entry.depth == max_depth),
        0,
    )
    total_references = sum(entry.count for entry in relationships.reference_counts)
    most_referenced = relationships.reference_counts[0] if relationships.reference_counts else None
    least_referenced = relationships.reference_counts[-1] if relationships.reference_counts else None
    top_references = [
        {"name": entry.name, "count": entry.count} for entry in relationships.reference_counts[:5]
    ]
    unused_non_enum_count = sum(
        1
        for issue in quality.issues
        if issue.category.startswith("Unused ") and issue.category != "Unused enums"
    )
    shortest_cycle_length = min((cycle.length for cycle in relationships.cyclic_references), default=0)
    depth_distribution = [
        {"depth": entry.depth, "path_count": entry.count} for entry in relationships.depth_distribution
    ]
    deepest_path_example = None
    if relationships.max_depth is not None:
        deepest_path_example = {
            "depth": relationships.max_depth.depth,
            "path": [segment.label for segment in relationships.max_depth.segments],
        }

    cycle_length_counts: dict[int, int] = {}
    for cycle in relationships.cyclic_references:
        cycle_length_counts[cycle.length] = cycle_length_counts.get(cycle.length, 0) + 1
    cycle_length_distribution = [
        {"length": length, "cycle_count": cycle_length_counts[length]}
        for length in sorted(cycle_length_counts)
    ]
    shortest_cycle_example = None
    if relationships.cyclic_references:
        shortest_cycle = min(relationships.cyclic_references, key=lambda cycle: cycle.length)
        shortest_cycle_example = {
            "length": shortest_cycle.length,
            "path": [segment.label for segment in shortest_cycle.segments],
        }

    return {
        "references_count": {
            "referenced": len(relationships.reference_counts),
            "total_references": total_references,
            "unused": unused_non_enum_count,
            "most_referenced": None
            if most_referenced is None
            else {"name": most_referenced.name, "count": most_referenced.count},
            "least_referenced": None
            if least_referenced is None
            else {"name": least_referenced.name, "count": least_referenced.count},
            "top_references": top_references,
        },
        "deepest_nested_paths": {
            "max_depth": max_depth,
            "paths_with_max_depth_count": deepest_count,
            "total_paths": relationships.total_paths,
            "depth_distribution": depth_distribution,
            "deepest_path_example": deepest_path_example,
        },
        "cyclic_references": {
            "count": len(relationships.cyclic_references),
            "shortest_length": shortest_cycle_length,
            "cycle_length_distribution": cycle_length_distribution,
            "shortest_cycle_example": shortest_cycle_example,
        },
    }

def build_quality_summary(
    coverage: CoverageResult,
    quality: QualityResult,
    concepts: ConceptsResult,
) -> dict[str, object]:
    unused_elements = _unused_summary(quality, concepts.counts)
    missing_units = _count_issues(quality, ("Missing units",))

    return {
        "coverage": _coverage_summary(coverage),
        "unused_elements": unused_elements,
        "missing_units": {
            "count": missing_units,
        },
    }
