import type { ScalarUsage } from "@/api/types";
import { EvidenceRow } from "@/components/explore/insights/EvidenceRow";
import { PagedList } from "@/components/explore/insights/PagedList";
import { ScalarTypeBadge } from "@/components/explore/insights/ScalarTypeBadge";
import { useAppSelector } from "@/store/hooks";
import { selectScalarUsage } from "@/store/insights/insightsSelectors";

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
	const scalarUsage = useAppSelector(selectScalarUsage);

	return (
		<PagedList
			items={scalarUsage}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <ScalarUsageRow {...entry} />}
		/>
	);
}
