import type { ScalarUsage } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectScalarUsage } from "@/store/insights/insightsSelectors";

export function ScalarUsageRow({ name, count, is_builtin }: ScalarUsage) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<div className="flex min-w-0 items-center gap-2">
				<span className="font-medium text-card-foreground">{name}</span>
				<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
					{is_builtin ? "built-in" : "custom"}
				</span>
			</div>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{count}</span>{" "}
				<span className="text-muted-foreground">fields</span>
			</span>
		</li>
	);
}

export function ScalarDistributionListDetail() {
	const scalarUsage = useAppSelector(selectScalarUsage);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(scalarUsage);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((entry) => (
					<ScalarUsageRow key={entry.name} {...entry} />
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
