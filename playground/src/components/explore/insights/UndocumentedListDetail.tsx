import type { UndocumentedEntity } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import { selectUndocumentedElements } from "@/store/insights/insightsSelectors";

export function UndocumentedRow({ name }: UndocumentedEntity) {
	return (
		<li className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
			<TypePathBreadcrumb segments={name.split(".")} maxSegments={5} />
		</li>
	);
}

export function UndocumentedListDetail({ entityKind }: { entityKind: string }) {
	const undocumentedElements = useAppSelector(selectUndocumentedElements);
	const elements = undocumentedElements.filter(
		(element) => element.kind === entityKind,
	);
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(elements);

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((element) => (
					<UndocumentedRow
						key={`${element.kind}:${element.name}`}
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
