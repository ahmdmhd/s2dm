import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import { selectEnumUsage } from "@insights-ui/selectors/concepts";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { EnumUsage } from "@insights-ui/types/concepts";

export function EnumUsageRow({ name, count }: EnumUsage) {
	return (
		<li>
			<EvidenceRow className="flex items-center justify-between gap-3 text-sm">
				<TypePathBreadcrumb segments={[name]} />
				<span className="shrink-0">
					<span className="font-bold text-card-foreground">{count}</span>{" "}
					<span className="text-muted-foreground">usages</span>
				</span>
			</EvidenceRow>
		</li>
	);
}

export function EnumUsageListDetail() {
	const enumUsage = useInsightsSelector(selectEnumUsage);

	return (
		<PagedList
			items={enumUsage}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <EnumUsageRow {...entry} />}
		/>
	);
}
