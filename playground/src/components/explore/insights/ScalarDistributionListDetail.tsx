import type { ScalarUsage } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { ScalarTypeBadge } from "@/components/explore/insights/ScalarTypeBadge";
import { useAppSelector } from "@/store/hooks";
import { selectScalarUsage } from "@/store/insights/insightsSelectors";

export function ScalarUsageRow({ name, count, is_builtin }: ScalarUsage) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<div className="flex min-w-0 items-center gap-2">
				<span className="font-medium text-card-foreground">{name}</span>
				<ScalarTypeBadge isBuiltin={is_builtin} />
			</div>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{count}</span>{" "}
				<span className="text-muted-foreground">fields</span>
			</span>
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
