import { createSelector } from "@reduxjs/toolkit";
import type {
	ConceptCounts,
	ConceptMembers,
	ContainerKind,
	CyclicReference,
	EnumUsage,
	EnumValueCount,
	QualityIssue,
	ReferenceCount,
	RelationshipPath,
	ScalarUsage,
	UndocumentedEntity,
} from "@/api/types";
import {
	selectInsightsConcepts,
	selectInsightsCoverage,
	selectInsightsQuality,
	selectInsightsRelationships,
} from "@/store/insights/insightsSlice";
import { groupBy } from "@/utils/groupBy";

export type BreakdownSegment = {
	label: string;
	value: number;
	colorClassName: string;
};

export type BreakdownStat = {
	label: string;
	value: number;
};

export type BreakdownGroup = {
	title: string;
	total: number;
	segments?: BreakdownSegment[];
	stats?: BreakdownStat[];
};

export type FieldWithType = {
	field: string;
	target: string;
};

export type ContainerTypeFieldCount = {
	type: string;
	fieldCount: number;
	kind: ContainerKind;
};

export type ContainerTypeFieldStats = {
	typeCount: number;
	total: number;
	average: number;
	median: number;
	max: number;
	min: number;
};

export type ScalarUsageStats = {
	scalarCount: number;
	totalOccurrences: number;
	builtinCount: number;
	customCount: number;
	topScalar: ScalarUsage;
};

export type EnumUsageStats = {
	usedCount: number;
	totalOccurrences: number;
	unusedCount: number;
	mostUsed: EnumUsage | null;
	leastUsed: EnumUsage | null;
};

export type ReferenceCountStats = {
	referencedCount: number;
	totalReferences: number;
	typeCount: number;
	directiveCount: number;
	unusedCount: number;
	mostReferenced: ReferenceCount | null;
	leastReferenced: ReferenceCount | null;
};

export type MissingUnitsStats = {
	count: number;
};

export type FieldGroup = {
	type: string;
	fields: string[];
};

export type DepthCountRow = {
	depth: number;
	pathCount: number;
};

export type PathDepthStats = {
	pathCount: number;
	max: number;
	deepestCount: number;
};

export type DepthGroup = {
	depth: number;
	paths: RelationshipPath[];
};

export type CycleLengthRow = {
	length: number;
	cycleCount: number;
};

export type CyclicReferenceStats = {
	cycleCount: number;
	shortest: number;
	shortestCount: number;
};

export type CycleGroup = {
	length: number;
	cycles: CyclicReference[];
};

export type CoverageCategory = {
	label: string;
	documented: number;
	total: number;
};

export type DocumentationCoverageStats = {
	overallCoverage: number;
	documented: number;
	total: number;
};

export type UndocumentedKindGroup = {
	kind: string;
	elements: UndocumentedEntity[];
};

export type UnusedCategory = {
	label: string;
	unused: number;
	total: number;
};

export type UnusedCategoryGroup = {
	category: string;
	elements: QualityIssue[];
};

// Bars roll the granular backend categories up to match the coverage card: "Types"
// aggregates every type kind, with "Enums" kept separate.
const UNUSED_CATEGORIES: {
	label: string;
	categories: string[];
	countKeys: (keyof ConceptCounts)[];
}[] = [
	{
		label: "Types",
		categories: [
			"Unused object types",
			"Unused interfaces",
			"Unused unions",
			"Unused input types",
			"Unused scalars",
		],
		countKeys: ["object", "interface", "union", "input", "scalar"],
	},
	{ label: "Enums", categories: ["Unused enums"], countKeys: ["enum"] },
	{
		label: "Directives",
		categories: ["Unused directives"],
		countKeys: ["directive"],
	},
];

const UNUSED_QUALITY_CATEGORIES = new Set(
	UNUSED_CATEGORIES.flatMap((entry) => entry.categories),
);

function median(values: number[]): number {
	if (values.length === 0) {
		return 0;
	}
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[middle - 1] + sorted[middle]) / 2;
	}
	return sorted[middle];
}

export const selectElementGroups = createSelector(
	selectInsightsConcepts,
	(concepts): BreakdownGroup[] => {
		if (!concepts) {
			return [];
		}
		const { counts } = concepts;
		const enumValues = concepts.enum_value_counts.map((entry) => entry.values);
		const totalEnumValues = enumValues.reduce((sum, value) => sum + value, 0);
		return [
			{
				title: "Field Container Types",
				total: counts.object + counts.interface + counts.input,
				segments: [
					{
						label: "Object Types",
						value: counts.object,
						colorClassName: "bg-sky-500",
					},
					{
						label: "Interface Types",
						value: counts.interface,
						colorClassName: "bg-purple-500",
					},
					{
						label: "Input Types",
						value: counts.input,
						colorClassName: "bg-emerald-500",
					},
				],
			},
			{
				title: "Fields",
				total: counts.field,
				segments: [
					{
						label: "Leaf fields",
						value: counts.leaf_field,
						colorClassName: "bg-sky-500",
					},
					{
						label: "Relationships fields",
						value: counts.relationship_field,
						colorClassName: "bg-purple-500",
					},
				],
			},
			{
				title: "Enums",
				total: counts.enum,
				stats: [
					{ label: "Enum values", value: totalEnumValues },
					{ label: "Median values/enum", value: median(enumValues) },
				],
			},
		];
	},
);

export const selectContainerTypeFieldCounts = createSelector(
	selectInsightsConcepts,
	(concepts): ContainerTypeFieldCount[] => {
		if (!concepts) {
			return [];
		}
		const counts = concepts.fields_by_type.map((entry) => ({
			type: entry.type,
			fieldCount: entry.fields.length,
			kind: entry.kind,
		}));
		counts.sort((a, b) => b.fieldCount - a.fieldCount);
		return counts;
	},
);

export const selectContainerTypeFieldStats = createSelector(
	selectContainerTypeFieldCounts,
	(counts): ContainerTypeFieldStats | null => {
		if (counts.length === 0) {
			return null;
		}
		const fieldCounts = counts.map((entry) => entry.fieldCount);
		const total = fieldCounts.reduce((sum, count) => sum + count, 0);
		return {
			typeCount: counts.length,
			total,
			average: total / counts.length,
			median: median(fieldCounts),
			max: Math.max(...fieldCounts),
			min: Math.min(...fieldCounts),
		};
	},
);

export const selectScalarUsage = createSelector(
	selectInsightsConcepts,
	(concepts): ScalarUsage[] => concepts?.scalar_usage ?? [],
);

export const selectScalarUsageStats = createSelector(
	selectScalarUsage,
	(scalarUsage): ScalarUsageStats | null => {
		const topScalar = scalarUsage[0];
		if (!topScalar) {
			return null;
		}
		const totalOccurrences = scalarUsage.reduce(
			(sum, entry) => sum + entry.count,
			0,
		);
		const builtinCount = scalarUsage.filter((entry) => entry.is_builtin).length;
		return {
			scalarCount: scalarUsage.length,
			totalOccurrences,
			builtinCount,
			customCount: scalarUsage.length - builtinCount,
			topScalar,
		};
	},
);

export const selectEnumUsage = createSelector(
	selectInsightsConcepts,
	(concepts): EnumUsage[] => concepts?.enum_usage ?? [],
);

export const selectUnusedEnumCount = createSelector(
	selectInsightsQuality,
	(quality): number =>
		quality?.issues.filter((issue) => issue.category === "Unused enums")
			.length ?? 0,
);

export const selectEnumUsageStats = createSelector(
	selectEnumUsage,
	selectUnusedEnumCount,
	(enumUsage, unusedCount): EnumUsageStats | null => {
		if (enumUsage.length === 0 && unusedCount === 0) {
			return null;
		}
		const totalOccurrences = enumUsage.reduce(
			(sum, entry) => sum + entry.count,
			0,
		);
		return {
			usedCount: enumUsage.length,
			totalOccurrences,
			unusedCount,
			mostUsed: enumUsage[0] ?? null,
			leastUsed: enumUsage[enumUsage.length - 1] ?? null,
		};
	},
);

const selectFieldsByRelationship = createSelector(
	selectInsightsConcepts,
	(concepts): { leaf: FieldWithType[]; relationship: FieldWithType[] } => {
		const leaf: FieldWithType[] = [];
		const relationship: FieldWithType[] = [];
		if (!concepts) {
			return { leaf, relationship };
		}
		for (const entry of concepts.fields_by_type) {
			for (const field of entry.fields) {
				const row = {
					field: `${entry.type}.${field.name}`,
					target: field.type,
				};
				if (field.is_relationship) {
					relationship.push(row);
				} else {
					leaf.push(row);
				}
			}
		}
		return { leaf, relationship };
	},
);

export const selectLeafFields = createSelector(
	selectFieldsByRelationship,
	(fields) => fields.leaf,
);

export const selectRelationshipFields = createSelector(
	selectFieldsByRelationship,
	(fields) => fields.relationship,
);

export const selectConceptMembers = createSelector(
	selectInsightsConcepts,
	(concepts): ConceptMembers | null => concepts?.members ?? null,
);

export const selectFieldGroups = createSelector(
	selectInsightsConcepts,
	(concepts): FieldGroup[] => {
		if (!concepts) {
			return [];
		}
		return concepts.fields_by_type.map((entry) => ({
			type: entry.type,
			fields: entry.fields.map((field) => field.name),
		}));
	},
);

export const selectEnums = createSelector(
	selectInsightsConcepts,
	(concepts): EnumValueCount[] => concepts?.enum_value_counts ?? [],
);

export const selectDepthDistribution = createSelector(
	selectInsightsRelationships,
	(relationships): DepthCountRow[] =>
		(relationships?.depth_distribution ?? []).map((entry) => ({
			depth: entry.depth,
			pathCount: entry.count,
		})),
);

export const selectPathDepthStats = createSelector(
	selectInsightsRelationships,
	(relationships): PathDepthStats | null => {
		if (!relationships) {
			return null;
		}
		const max = relationships.max_depth?.depth ?? 0;
		const deepest = relationships.depth_distribution.find(
			(entry) => entry.depth === max,
		);
		return {
			pathCount: relationships.total_paths,
			max,
			deepestCount: deepest?.count ?? 0,
		};
	},
);

export const selectDeepestPath = createSelector(
	selectInsightsRelationships,
	(relationships): RelationshipPath | null => relationships?.max_depth ?? null,
);

export const selectDepthGroups = createSelector(
	selectInsightsRelationships,
	(relationships): DepthGroup[] => {
		if (!relationships) {
			return [];
		}
		const pathsByDepth = groupBy(relationships.paths, (path) => path.depth);
		const groups = Array.from(pathsByDepth, ([depth, paths]) => ({
			depth,
			paths,
		}));
		groups.sort((a, b) => b.depth - a.depth);
		return groups;
	},
);

export const selectCyclicReferences = createSelector(
	selectInsightsRelationships,
	(relationships): CyclicReference[] => relationships?.cyclic_references ?? [],
);

export const selectCycleLengthDistribution = createSelector(
	selectCyclicReferences,
	(cycles): CycleLengthRow[] => {
		const countsByLength = new Map<number, number>();
		for (const cycle of cycles) {
			const current = countsByLength.get(cycle.length) ?? 0;
			countsByLength.set(cycle.length, current + 1);
		}
		const rows = Array.from(countsByLength, ([length, cycleCount]) => ({
			length,
			cycleCount,
		}));
		rows.sort((a, b) => a.length - b.length);
		return rows;
	},
);

export const selectCyclicReferenceStats = createSelector(
	selectCyclicReferences,
	(cycles): CyclicReferenceStats | null => {
		if (cycles.length === 0) {
			return null;
		}
		const lengths = cycles.map((cycle) => cycle.length);
		const shortest = Math.min(...lengths);
		const shortestCount = lengths.filter(
			(length) => length === shortest,
		).length;
		return {
			cycleCount: cycles.length,
			shortest,
			shortestCount,
		};
	},
);

export const selectShortestCycle = createSelector(
	selectCyclicReferences,
	(cycles): CyclicReference | null => {
		if (cycles.length === 0) {
			return null;
		}
		let shortest = cycles[0];
		for (const cycle of cycles) {
			if (cycle.length < shortest.length) {
				shortest = cycle;
			}
		}
		return shortest;
	},
);

export const selectCycleGroups = createSelector(
	selectCyclicReferences,
	(cycles): CycleGroup[] => {
		const cyclesByLength = groupBy(cycles, (cycle) => cycle.length);
		const groups = Array.from(cyclesByLength, ([length, groupCycles]) => ({
			length,
			cycles: groupCycles,
		}));
		groups.sort((a, b) => a.length - b.length);
		return groups;
	},
);

export const selectCoverageCategories = createSelector(
	selectInsightsCoverage,
	(coverage): CoverageCategory[] => {
		if (!coverage) {
			return [];
		}
		const { breakdown } = coverage;
		return [
			{
				label: "Types",
				documented: breakdown.types.documented,
				total: breakdown.types.total,
			},
			{
				label: "Fields",
				documented: breakdown.fields.documented,
				total: breakdown.fields.total,
			},
			{
				label: "Enums",
				documented: breakdown.enums.documented,
				total: breakdown.enums.total,
			},
			{
				label: "Enum Values",
				documented: breakdown.enum_values.documented,
				total: breakdown.enum_values.total,
			},
			{
				label: "Directives",
				documented: breakdown.directives.documented,
				total: breakdown.directives.total,
			},
		];
	},
);

export const selectDocumentationCoverageStats = createSelector(
	selectCoverageCategories,
	(categories): DocumentationCoverageStats | null => {
		if (categories.length === 0) {
			return null;
		}
		const total = categories.reduce((sum, category) => sum + category.total, 0);
		const documented = categories.reduce(
			(sum, category) => sum + category.documented,
			0,
		);
		const overallCoverage =
			total === 0 ? 0 : Math.round((documented / total) * 100);
		return { overallCoverage, documented, total };
	},
);

export const selectUndocumentedElements = createSelector(
	selectInsightsCoverage,
	(coverage): UndocumentedEntity[] => coverage?.undocumented ?? [],
);

export const selectUndocumentedByKind = createSelector(
	selectUndocumentedElements,
	(elements): UndocumentedKindGroup[] => {
		const elementsByKind = groupBy(elements, (element) => element.kind);
		return Array.from(elementsByKind, ([kind, kindElements]) => ({
			kind,
			elements: kindElements,
		}));
	},
);

export const selectUnusedElements = createSelector(
	selectInsightsQuality,
	(quality): QualityIssue[] => {
		if (!quality) {
			return [];
		}
		return quality.issues.filter((issue) =>
			UNUSED_QUALITY_CATEGORIES.has(issue.category),
		);
	},
);

export const selectReferenceCounts = createSelector(
	selectInsightsRelationships,
	(relationships): ReferenceCount[] => relationships?.reference_counts ?? [],
);

export const selectReferenceCountStats = createSelector(
	selectReferenceCounts,
	selectUnusedElements,
	(referenceCounts, unusedElements): ReferenceCountStats | null => {
		const unusedCount = unusedElements.filter(
			(element) => element.category !== "Unused enums",
		).length;
		if (referenceCounts.length === 0 && unusedCount === 0) {
			return null;
		}
		const totalReferences = referenceCounts.reduce(
			(sum, entry) => sum + entry.count,
			0,
		);
		const typeCount = referenceCounts.filter(
			(entry) => entry.kind === "type",
		).length;
		return {
			referencedCount: referenceCounts.length,
			totalReferences,
			typeCount,
			directiveCount: referenceCounts.length - typeCount,
			unusedCount,
			mostReferenced: referenceCounts[0] ?? null,
			leastReferenced: referenceCounts[referenceCounts.length - 1] ?? null,
		};
	},
);

export const selectMissingUnits = createSelector(
	selectInsightsQuality,
	(quality): QualityIssue[] =>
		quality?.issues.filter((issue) => issue.category === "Missing units") ?? [],
);

export const selectMissingUnitsStats = createSelector(
	selectInsightsQuality,
	selectMissingUnits,
	(quality, missingUnits): MissingUnitsStats | null => {
		if (!quality) {
			return null;
		}
		return { count: missingUnits.length };
	},
);

export const selectUnusedCategories = createSelector(
	selectInsightsQuality,
	selectInsightsConcepts,
	(quality, concepts): UnusedCategory[] => {
		if (!quality || !concepts) {
			return [];
		}
		return UNUSED_CATEGORIES.map((entry) => {
			const categorySet = new Set(entry.categories);
			const unused = quality.issues.filter((issue) =>
				categorySet.has(issue.category),
			).length;
			const total = entry.countKeys.reduce(
				(sum, key) => sum + concepts.counts[key],
				0,
			);
			return { label: entry.label, unused, total };
		});
	},
);

export const selectUnusedByCategory = createSelector(
	selectUnusedElements,
	(elements): UnusedCategoryGroup[] => {
		const elementsByCategory = groupBy(elements, (element) => element.category);
		return Array.from(elementsByCategory, ([category, categoryElements]) => ({
			category,
			elements: categoryElements,
		}));
	},
);
