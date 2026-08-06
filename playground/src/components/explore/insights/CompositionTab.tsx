import { EnumUsageCard } from "@insights-ui/components/EnumUsageCard";
import { FieldsByTypeChart } from "@insights-ui/components/FieldsByTypeChart";
import { ScalarDistributionChart } from "@insights-ui/components/ScalarDistributionChart";
import { TabsContent } from "@/components/ui/tabs";

export function CompositionTab() {
	return (
		<TabsContent
			value="composition"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="flex flex-col gap-4 p-4">
				<FieldsByTypeChart />
				<ScalarDistributionChart />
				<EnumUsageCard />
			</div>
		</TabsContent>
	);
}
