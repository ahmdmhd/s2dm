import { createSelector } from "@reduxjs/toolkit";
import type {
	ConceptMembers,
	ContainerKind,
	EnumValueCount,
	RelationshipPath,
	UndocumentedEntity,
} from "@/api/types";
import {
	selectInsightsConcepts,
	selectInsightsCoverage,
	selectInsightsRelationships,
} from "@/store/insights/insightsSlice";

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

export type CoverageCategory = {
	label: string;
	documented: number;
	total: number;
};

export type UndocumentedKindGroup = {
	kind: string;
	elements: UndocumentedEntity[];
};

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
		const pathsByDepth = new Map<number, RelationshipPath[]>();
		for (const path of relationships.paths) {
			const group = pathsByDepth.get(path.depth) ?? [];
			group.push(path);
			pathsByDepth.set(path.depth, group);
		}
		const groups = Array.from(pathsByDepth, ([depth, paths]) => ({
			depth,
			paths,
		}));
		groups.sort((a, b) => b.depth - a.depth);
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

export const selectUndocumentedElements = createSelector(
	selectInsightsCoverage,
	(coverage): UndocumentedEntity[] => coverage?.undocumented ?? [],
);

export const selectUndocumentedByKind = createSelector(
	selectUndocumentedElements,
	(elements): UndocumentedKindGroup[] => {
		const elementsByKind = new Map<string, UndocumentedEntity[]>();
		for (const element of elements) {
			const group = elementsByKind.get(element.kind) ?? [];
			group.push(element);
			elementsByKind.set(element.kind, group);
		}
		return Array.from(elementsByKind, ([kind, kindElements]) => ({
			kind,
			elements: kindElements,
		}));
	},
);
