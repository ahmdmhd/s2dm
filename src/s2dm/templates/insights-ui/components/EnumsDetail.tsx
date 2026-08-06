import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import { selectEnums } from "@insights-ui/selectors/concepts";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { EnumValueCount } from "@insights-ui/types/concepts";
import pluralize from "pluralize";

export function EnumRow({
	name,
	values,
	rank,
}: EnumValueCount & { rank?: string }) {
	return (
		<li>
			<EvidenceRow className="flex items-center justify-between gap-3">
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
			</EvidenceRow>
		</li>
	);
}

export function EnumsDetail() {
	const enums = useInsightsSelector(selectEnums);

	return (
		<PagedList
			items={enums}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <EnumRow {...entry} />}
		/>
	);
}
