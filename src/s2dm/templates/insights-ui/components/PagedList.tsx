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

	const rows = visibleItems.map((item) => (
		<Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
	));

	let list: ReactNode;
	if (as === "ul") {
		list = <EvidenceList className={listClassName}>{rows}</EvidenceList>;
	} else {
		list = <div className={listClassName}>{rows}</div>;
	}

	return (
		<div className={containerClassName}>
			{list}
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
