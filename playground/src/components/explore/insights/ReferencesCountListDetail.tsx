import type { ReferenceCount } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { useAppSelector } from "@/store/hooks";
import { selectReferenceCounts } from "@/store/insights/insightsSelectors";

export function ReferenceCountRow({ name, count }: ReferenceCount) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<div className="flex min-w-0 items-center gap-2">
				<span className="truncate font-medium text-card-foreground">
					{name}
				</span>
			</div>
			<span className="shrink-0">
				<span className="font-bold text-card-foreground">{count}</span>{" "}
				<span className="text-muted-foreground">refs</span>
			</span>
		</li>
	);
}

export function ReferencesCountListDetail() {
	const referenceCounts = useAppSelector(selectReferenceCounts);

	return (
		<PagedList
			items={referenceCounts}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <ReferenceCountRow {...entry} />}
		/>
	);
}
