import type { QualityIssue } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectUnusedElements } from "@/store/insights/insightsSelectors";

export function UnusedRow({ target }: QualityIssue) {
	return (
		<li className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
			<TypePathBreadcrumb segments={target.split(".")} maxSegments={5} />
		</li>
	);
}

export function UnusedListDetail({ category }: { category: string }) {
	const unusedElements = useAppSelector(selectUnusedElements);
	const elements = unusedElements.filter(
		(element) => element.category === category,
	);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(elements);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((element) => (
					<UnusedRow
						key={`${element.category}:${element.target}`}
						{...element}
					/>
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
