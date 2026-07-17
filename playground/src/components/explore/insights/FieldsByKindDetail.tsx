import { ArrowRight } from "lucide-react";
import type { ContainerKind } from "@/api/types";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import {
	type FieldWithType,
	selectLeafFields,
	selectRelationshipFields,
} from "@/store/insights/insightsSelectors";

export const CONTAINER_KIND_DOT_CLASSES: Record<ContainerKind, string> = {
	object: "bg-sky-500",
	interface: "bg-purple-500",
	input: "bg-emerald-500",
};

export function FieldTypeRow({ field, target }: FieldWithType) {
	return (
		<div className="flex items-center gap-2">
			<TypePathBreadcrumb segments={field.split(".")} />
			<ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
			<span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-xs text-card-foreground">
				{target}
			</span>
		</div>
	);
}

type FieldsByKindDetailProps = {
	fieldKind: "leaf" | "relationship";
};

export function FieldsByKindDetail({ fieldKind }: FieldsByKindDetailProps) {
	const leafFields = useAppSelector(selectLeafFields);
	const relationshipFields = useAppSelector(selectRelationshipFields);
	const fields = fieldKind === "relationship" ? relationshipFields : leafFields;
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(fields);

	return (
		<div className="flex flex-col gap-2">
			{visibleItems.map((entry) => (
				<FieldTypeRow key={entry.field} {...entry} />
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
