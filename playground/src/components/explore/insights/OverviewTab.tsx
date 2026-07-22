import { CompositionSummaryCard } from "@/components/explore/insights/CompositionSummaryCard";
import { ConceptsBreakdown } from "@/components/explore/insights/ConceptsBreakdown";
import { QualitySummaryCard } from "@/components/explore/insights/QualitySummaryCard";
import { TabsContent } from "@/components/ui/tabs";

export function OverviewTab() {
	return (
		<TabsContent
			value="overview"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="flex flex-col gap-4 p-4">
				<ConceptsBreakdown />
				<CompositionSummaryCard />
				<QualitySummaryCard />
			</div>
		</TabsContent>
	);
}
