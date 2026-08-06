import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import { selectReferenceCounts } from "@insights-ui/selectors/relationships";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { ReferenceCount } from "@insights-ui/types/relationships";

export function ReferenceCountRow({ name, count }: ReferenceCount) {
	return (
		<li>
			<EvidenceRow className="flex items-center justify-between gap-3 text-sm">
				<div className="flex min-w-0 items-center gap-2">
					<TypePathBreadcrumb segments={[name]} />
				</div>
				<span className="shrink-0">
					<span className="font-bold text-card-foreground">{count}</span>{" "}
					<span className="text-muted-foreground">refs</span>
				</span>
			</EvidenceRow>
		</li>
	);
}

export function ReferencesCountListDetail() {
	const referenceCounts = useInsightsSelector(selectReferenceCounts);

	return (
		<PagedList
			items={referenceCounts}
			getKey={(entry) => entry.name}
			renderItem={(entry) => <ReferenceCountRow {...entry} />}
		/>
	);
}
