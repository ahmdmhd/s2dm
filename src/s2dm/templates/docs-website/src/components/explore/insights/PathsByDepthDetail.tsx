import type { RelationshipPath } from "@/api/types";
import { ExpandableTypePathRow } from "@/components/explore/insights/ExpandableTypePathRow";
import { PagedList } from "@/components/explore/insights/PagedList";
import { useAppSelector } from "@/store/hooks";
import { selectDepthGroups } from "@/store/insights/insightsSelectors";
import { formatPathSegments } from "@/utils/formatPathSegments";

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
	const depthGroups = useAppSelector(selectDepthGroups);
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
