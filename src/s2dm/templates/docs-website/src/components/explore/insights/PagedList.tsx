import { Fragment, type ReactNode } from "react";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { usePagedItems } from "@/hooks/usePagedItems";

type PagedListProps<Item> = {
	items: Item[];
	getKey: (item: Item) => string;
	renderItem: (item: Item) => ReactNode;
	containerClassName?: string;
	listClassName?: string;
	as?: "div" | "ul";
};

export function PagedList<Item>({
	items,
	getKey,
	renderItem,
	containerClassName = "flex flex-col gap-2",
	listClassName = "flex flex-col gap-2",
	as = "ul",
}: PagedListProps<Item>) {
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(items);
	const ListTag = as;

	return (
		<div className={containerClassName}>
			<ListTag className={listClassName}>
				{visibleItems.map((item) => (
					<Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
				))}
			</ListTag>
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
