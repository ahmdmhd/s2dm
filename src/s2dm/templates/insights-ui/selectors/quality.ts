import {
	selectInsightsConcepts,
	selectInsightsQuality,
} from "@insights-ui/state/insightsSlice";
import type { ConceptCounts } from "@insights-ui/types/concepts";
import type { QualityIssue } from "@insights-ui/types/quality";
import { groupBy } from "@insights-ui/utils/groupBy";
import { createSelector } from "@reduxjs/toolkit";

type MissingUnitsStats = {
	count: number;
};

type UnusedCategory = {
	label: string;
	unused: number;
	total: number;
};

type UnusedCategoryGroup = {
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
