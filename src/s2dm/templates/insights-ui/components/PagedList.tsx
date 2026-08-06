import { EvidenceList } from "@insights-ui/components/EvidenceList";
import { ListPagination } from "@insights-ui/components/ListPagination";
import { usePagedItems } from "@insights-ui/hooks/usePagedItems";
import { Fragment, type ReactNode } from "react";

type PagedListProps<Item> = {
	items: Item[];
	getKey: (item: Item) => string;
	renderItem: (item: Item) => ReactNode;
	containerClassName?: string;
	listClassName?: string;
};

export function PagedList<Item>({
	items,
	getKey,
	renderItem,
	containerClassName = "flex flex-col gap-2",
	listClassName = "flex flex-col gap-2",
}: PagedListProps<Item>) {
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(items);

	return (
		<div className={containerClassName}>
			<EvidenceList className={listClassName}>
				{visibleItems.map((item) => (
					<Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
				))}
			</EvidenceList>
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
