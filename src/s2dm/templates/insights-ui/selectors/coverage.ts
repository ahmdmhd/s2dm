import { selectInsightsCoverage } from "@insights-ui/state/insightsSlice";
import type { UndocumentedEntity } from "@insights-ui/types/coverage";
import { groupBy } from "@insights-ui/utils/groupBy";
import { createSelector } from "@reduxjs/toolkit";

type CoverageCategory = {
	label: string;
	documented: number;
	total: number;
};

type DocumentationCoverageStats = {
	overallCoverage: number;
	documented: number;
	total: number;
};

type UndocumentedKindGroup = {
	kind: string;
	elements: UndocumentedEntity[];
};

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
