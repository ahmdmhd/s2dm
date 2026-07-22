import { CyclicReferencesChart } from "@/components/explore/insights/CyclicReferencesChart";
import { DeepestPathsChart } from "@/components/explore/insights/DeepestPathsChart";
import { ReferencesCountCard } from "@/components/explore/insights/ReferencesCountCard";
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
