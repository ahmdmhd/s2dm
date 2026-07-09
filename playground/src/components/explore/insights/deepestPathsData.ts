import { RELATIONSHIP_FIELDS } from "@/components/explore/insights/FieldsByKindDetail";

export type TypePath = {
	segments: string[];
	depth: number;
};

function cleanTypeName(target: string): string {
	return target.replace(/[[\]!]/g, "");
}

function buildRelationshipEdges(): Map<string, string[]> {
	const edges = new Map<string, string[]>();
	for (const { field, target } of RELATIONSHIP_FIELDS) {
		const [sourceType] = field.split(".");
		const targetType = cleanTypeName(target);
		const targets = edges.get(sourceType) ?? [];
		targets.push(targetType);
		edges.set(sourceType, targets);
	}
	return edges;
}

function computeTypePaths(): TypePath[] {
	const edges = buildRelationshipEdges();
	const paths: TypePath[] = [];

	function walk(visited: string[]) {
		const current = visited[visited.length - 1];
		const nextTypes = (edges.get(current) ?? []).filter(
			(type) => !visited.includes(type),
		);
		if (nextTypes.length === 0) {
			if (visited.length > 1) {
				paths.push({ segments: visited, depth: visited.length - 1 });
			}
			return;
		}
		for (const next of nextTypes) {
			walk([...visited, next]);
		}
	}

	for (const rootType of edges.keys()) {
		walk([rootType]);
	}
	paths.sort((a, b) => b.depth - a.depth);
	return paths;
}

export const TYPE_PATHS = computeTypePaths();

export type DepthGroup = {
	depth: number;
	paths: TypePath[];
};

function groupPathsByDepth(paths: TypePath[]): DepthGroup[] {
	const pathsByDepth = new Map<number, TypePath[]>();
	for (const path of paths) {
		const group = pathsByDepth.get(path.depth) ?? [];
		group.push(path);
		pathsByDepth.set(path.depth, group);
	}
	const groups = Array.from(pathsByDepth, ([depth, groupPaths]) => ({
		depth,
		paths: groupPaths,
	}));
	groups.sort((a, b) => b.depth - a.depth);
	return groups;
}

export const DEPTH_GROUPS = groupPathsByDepth(TYPE_PATHS);

export type DepthCount = {
	depth: number;
	pathCount: number;
};

export const DEPTH_DISTRIBUTION: DepthCount[] = DEPTH_GROUPS.map((group) => ({
	depth: group.depth,
	pathCount: group.paths.length,
})).sort((a, b) => a.depth - b.depth);

const maxDepth = Math.max(...TYPE_PATHS.map((path) => path.depth));

export const PATH_DEPTH_STATS = {
	pathCount: TYPE_PATHS.length,
	max: maxDepth,
	deepestCount: TYPE_PATHS.filter((path) => path.depth === maxDepth).length,
};
