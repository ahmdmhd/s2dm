import { useState } from "react";

const DEFAULT_PAGE_SIZE = 50;

export function usePagedItems<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
	const [visibleCount, setVisibleCount] = useState(pageSize);
	const visibleItems = items.slice(0, visibleCount);
	const hasMore = visibleCount < items.length;
	const showMore = () =>
		setVisibleCount((count) => Math.min(count + pageSize, items.length));

	return {
		visibleItems,
		hasMore,
		shown: visibleItems.length,
		total: items.length,
		pageSize,
		showMore,
	};
}
