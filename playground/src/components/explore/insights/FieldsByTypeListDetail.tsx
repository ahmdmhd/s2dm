import { CONTAINER_KIND_DOT_CLASSES } from "@/components/explore/insights/FieldsByKindDetail";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import {
	type ContainerTypeFieldCount,
	selectContainerTypeFieldCounts,
} from "@/store/insights/insightsSelectors";
import { cn } from "@/utils/cn";

export function ContainerTypeRow({
	type,
	fieldCount,
	kind,
}: ContainerTypeFieldCount) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<div className="flex min-w-0 items-center gap-2">
				<TypePathBreadcrumb segments={[type]} />
				<span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
					<span
						className={cn(
							"h-2 w-2 rounded-sm",
							CONTAINER_KIND_DOT_CLASSES[kind],
						)}
					/>
					{kind}
				</span>
			</div>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{fieldCount}</span>{" "}
				<span className="text-muted-foreground">fields</span>
			</span>
		</li>
	);
}

export function FieldsByTypeListDetail() {
	const containerTypeFieldCounts = useAppSelector(
		selectContainerTypeFieldCounts,
	);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(containerTypeFieldCounts);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((entry) => (
					<ContainerTypeRow key={entry.type} {...entry} />
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
