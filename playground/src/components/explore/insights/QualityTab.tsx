import { DocumentationCoverageCard } from "@/components/explore/insights/DocumentationCoverageCard";
import { MissingUnitsCard } from "@/components/explore/insights/MissingUnitsCard";
import { UnusedElementsCard } from "@/components/explore/insights/UnusedElementsCard";
import { TabsContent } from "@/components/ui/tabs";

export function QualityTab() {
	return (
		<TabsContent
			value="quality"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="flex flex-col gap-4 p-4">
				<DocumentationCoverageCard />
				<UnusedElementsCard />
				<MissingUnitsCard />
			</div>
		</TabsContent>
	);
}
