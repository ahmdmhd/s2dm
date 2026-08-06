import { CyclicReferencesChart } from "@insights-ui/components/CyclicReferencesChart";
import { DeepestPathsChart } from "@insights-ui/components/DeepestPathsChart";
import { ReferencesCountCard } from "@insights-ui/components/ReferencesCountCard";
import { TabsContent } from "@/components/ui/tabs";

export function RelationshipsTab() {
	return (
		<TabsContent
			value="relationships"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="grid grid-cols-1 gap-4 p-4">
				<ReferencesCountCard />
				<DeepestPathsChart />
				<CyclicReferencesChart />
			</div>
		</TabsContent>
	);
}
