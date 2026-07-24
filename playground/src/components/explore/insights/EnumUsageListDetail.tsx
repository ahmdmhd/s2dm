import type { EnumUsage } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { useAppSelector } from "@/store/hooks";
import { selectEnumUsage } from "@/store/insights/insightsSelectors";

export function EnumUsageRow({ name, count }: EnumUsage) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<span className="min-w-0 truncate font-medium text-card-foreground">
				{name}
			</span>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{count}</span>{" "}
				<span className="text-muted-foreground">usages</span>
			</span>
		</li>
	);
}

export function EnumUsageListDetail() {
	const enumUsage = useAppSelector(selectEnumUsage);

	return (
		<PagedList
			items={enumUsage}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <EnumUsageRow {...entry} />}
		/>
	);
}
