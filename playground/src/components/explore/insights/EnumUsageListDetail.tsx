import type { EnumUsage } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectEnumUsage } from "@/store/insights/insightsSelectors";

export function EnumUsageRow({ name, count }: EnumUsage) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<span className="min-w-0 truncate font-medium text-card-foreground">
				{name}
			</span>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{count}</span>{" "}
				<span className="text-muted-foreground">fields</span>
			</span>
		</li>
	);
}

export function EnumUsageListDetail() {
	const enumUsage = useAppSelector(selectEnumUsage);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(enumUsage);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((entry) => (
					<EnumUsageRow key={entry.name} {...entry} />
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
