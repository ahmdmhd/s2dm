import pluralize from "pluralize";
import type { EnumValueCount } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
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
				{values} {pluralize("value", values)}
			</span>
		</div>
	);
}

export function EnumsDetail() {
	const enums = useAppSelector(selectEnums);

	return (
		<PagedList
			items={enums}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <EnumRow {...entry} />}
			as="div"
		/>
	);
}
