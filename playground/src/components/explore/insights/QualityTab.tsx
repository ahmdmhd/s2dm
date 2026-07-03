import { DocumentationCoverageCard } from "@/components/explore/insights/DocumentationCoverageCard";
import { TabsContent } from "@/components/ui/tabs";

export function QualityTab() {
	return (
		<TabsContent
			value="quality"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="p-4">
				<DocumentationCoverageCard />
			</div>
		</TabsContent>
	);
}
