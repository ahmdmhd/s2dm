import { FieldsByTypeChart } from "@/components/explore/insights/FieldsByTypeChart";
import { TabsContent } from "@/components/ui/tabs";

export function CompositionTab() {
	return (
		<TabsContent
			value="composition"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="p-4">
				<FieldsByTypeChart />
			</div>
		</TabsContent>
	);
}
