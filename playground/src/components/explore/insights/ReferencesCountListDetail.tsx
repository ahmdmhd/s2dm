import type { ReferenceCount } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectReferenceCounts } from "@/store/insights/insightsSelectors";

export function ReferenceCountRow({ name, count, kind }: ReferenceCount) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<div className="flex min-w-0 items-center gap-2">
				<span className="truncate font-medium text-card-foreground">
					{name}
				</span>
				<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
					{kind}
				</span>
			</div>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{count}</span>{" "}
				<span className="text-muted-foreground">refs</span>
			</span>
		</li>
	);
}

export function ReferencesCountListDetail() {
	const referenceCounts = useAppSelector(selectReferenceCounts);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(referenceCounts);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((entry) => (
					<ReferenceCountRow key={entry.name} {...entry} />
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
