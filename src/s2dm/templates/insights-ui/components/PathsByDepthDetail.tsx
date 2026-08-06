import { ExpandableTypePathRow } from "@insights-ui/components/ExpandableTypePathRow";
import { PagedList } from "@insights-ui/components/PagedList";
import { selectDepthGroups } from "@insights-ui/selectors/relationships";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { RelationshipPath } from "@insights-ui/types/relationships";
import { formatPathSegments } from "@insights-ui/utils/formatPathSegments";

export function PathRow({ path }: { path: RelationshipPath }) {
	const segmentLabels = formatPathSegments(path.segments);

	return (
		<ExpandableTypePathRow
			segments={segmentLabels}
			metric={path.depth}
			metricLabel="deep"
		/>
	);
}

export function PathsByDepthDetail({ depth }: { depth: number }) {
	const depthGroups = useInsightsSelector(selectDepthGroups);
	const group = depthGroups.find((entry) => entry.depth === depth);
	const paths = group?.paths ?? [];

	return (
		<PagedList
			items={paths}
			getKey={(path) => formatPathSegments(path.segments).join(">")}
			renderItem={(path) => <PathRow path={path} />}
		/>
	);
}
