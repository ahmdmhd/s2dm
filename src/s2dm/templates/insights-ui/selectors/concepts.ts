import {
	selectInsightsConcepts,
	selectInsightsQuality,
} from "@insights-ui/state/insightsSlice";
import type {
	ConceptMembers,
	ContainerKind,
	EnumUsage,
	EnumValueCount,
	ScalarUsage,
} from "@insights-ui/types/concepts";
import { median } from "@insights-ui/utils/median";
import { createSelector } from "@reduxjs/toolkit";

export type BreakdownSegment = {
	label: string;
	value: number;
	colorClassName: string;
};

type BreakdownStat = {
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

type ContainerTypeFieldStats = {
	typeCount: number;
	total: number;
	average: number;
	median: number;
	max: number;
	min: number;
};

type ScalarUsageStats = {
	scalarCount: number;
	totalOccurrences: number;
	builtinCount: number;
	customCount: number;
	topScalar: ScalarUsage;
};

type EnumUsageStats = {
	usedCount: number;
	totalOccurrences: number;
	unusedCount: number;
	mostUsed: EnumUsage | null;
	leastUsed: EnumUsage | null;
};

type FieldGroup = {
	type: string;
	fields: string[];
};

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

const selectUnusedEnumCount = createSelector(
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
