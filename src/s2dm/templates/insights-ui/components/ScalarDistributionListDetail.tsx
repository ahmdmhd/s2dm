import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { PagedList } from "@insights-ui/components/PagedList";
import { ScalarTypeBadge } from "@insights-ui/components/ScalarTypeBadge";
import { selectScalarUsage } from "@insights-ui/selectors/concepts";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { ScalarUsage } from "@insights-ui/types/concepts";

export function ScalarUsageRow({ name, count, is_builtin }: ScalarUsage) {
	return (
		<li>
			<EvidenceRow className="flex items-center justify-between gap-3 text-sm">
				<div className="flex min-w-0 items-center gap-2">
					<span className="font-medium text-card-foreground">{name}</span>
					<ScalarTypeBadge isBuiltin={is_builtin} />
				</div>
				<span className="shrink-0">
					<span className="font-bold text-card-foreground">{count}</span>{" "}
					<span className="text-muted-foreground">fields</span>
				</span>
			</EvidenceRow>
		</li>
	);
}

export function ScalarDistributionListDetail() {
	const scalarUsage = useInsightsSelector(selectScalarUsage);

	return (
		<PagedList
			items={scalarUsage}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <ScalarUsageRow {...entry} />}
		/>
	);
}
