import { useState } from "react";
import type { RelationshipPath } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { TypePathTree } from "@/components/explore/insights/TypePathTree";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectDepthGroups } from "@/store/insights/insightsSelectors";

export function PathRow({ path }: { path: RelationshipPath }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<li className="rounded-md border border-border">
			<button
				type="button"
				onClick={() => setExpanded((open) => !open)}
				className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left"
			>
				<TypePathBreadcrumb segments={path.segments} maxSegments={5} />
				<span className="shrink-0 text-sm">
					<span className="font-bold text-card-foreground">{path.depth}</span>{" "}
					<span className="text-muted-foreground">deep</span>
				</span>
			</button>
			{expanded && (
				<div className="border-t border-border px-3 py-2">
					<TypePathTree segments={path.segments} />
				</div>
			)}
		</li>
	);
}

export function PathsByDepthDetail({ depth }: { depth: number }) {
	const depthGroups = useAppSelector(selectDepthGroups);
	const group = depthGroups.find((entry) => entry.depth === depth);
	const paths = group?.paths ?? [];
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(paths);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((path) => (
					<PathRow key={path.segments.join(">")} path={path} />
				))}
			</ul>
			<ListPagination
				shown={shown}
				total={total}
				hasMore={hasMore}
				pageSize={pageSize}
				onShowMore={showMore}
			/>
		</div>
	);
}
