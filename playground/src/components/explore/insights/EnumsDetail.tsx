import type { EnumValueCount } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectEnums } from "@/store/insights/insightsSelectors";

export function EnumRow({
	name,
	values,
	rank,
}: EnumValueCount & { rank?: string }) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
			<div className="flex min-w-0 items-center gap-2">
				{rank && (
					<span className="shrink-0 text-xs font-medium text-muted-foreground">
						({rank})
					</span>
				)}
				<TypePathBreadcrumb segments={[name]} />
			</div>
			<span className="shrink-0 font-medium text-card-foreground">
				{values} values
			</span>
		</div>
	);
}

export function EnumsDetail() {
	const enums = useAppSelector(selectEnums);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(enums);

	return (
		<div className="flex flex-col gap-2">
			{visibleItems.map((entry) => (
				<EnumRow key={entry.name} {...entry} />
			))}
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
