import { selectUnusedElements } from "@insights-ui/selectors/quality";
import { selectInsightsRelationships } from "@insights-ui/state/insightsSlice";
import type {
	CyclicReference,
	ReferenceCount,
	RelationshipPath,
} from "@insights-ui/types/relationships";
import { groupBy } from "@insights-ui/utils/groupBy";
import { createSelector } from "@reduxjs/toolkit";

type DepthCountRow = {
	depth: number;
	pathCount: number;
};

type PathDepthStats = {
	pathCount: number;
	max: number;
	deepestCount: number;
};

type DepthGroup = {
	depth: number;
	paths: RelationshipPath[];
};

type CycleLengthRow = {
	length: number;
	cycleCount: number;
};

type CyclicReferenceStats = {
	cycleCount: number;
	shortest: number;
	shortestCount: number;
};

type CycleGroup = {
	length: number;
	cycles: CyclicReference[];
};

type ReferenceCountStats = {
	referencedCount: number;
	totalReferences: number;
	unusedCount: number;
	mostReferenced: ReferenceCount | null;
	leastReferenced: ReferenceCount | null;
};

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

const selectCyclicReferences = createSelector(
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
		return {
			referencedCount: referenceCounts.length,
			totalReferences,
			unusedCount,
			mostReferenced: referenceCounts[0] ?? null,
			leastReferenced: referenceCounts[referenceCounts.length - 1] ?? null,
		};
	},
);
