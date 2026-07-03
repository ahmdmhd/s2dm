import { useState } from "react";
import { CompositionTab } from "@/components/explore/insights/CompositionTab";
import { OverviewTab } from "@/components/explore/insights/OverviewTab";
import { QualityTab } from "@/components/explore/insights/QualityTab";
import { RelationshipsTab } from "@/components/explore/insights/RelationshipsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from "@/store/hooks";
import { closeInsightDetail } from "@/store/ui/uiSlice";

type InsightsSubTab = "overview" | "composition" | "relationships" | "quality";

export function InsightsTab() {
	const dispatch = useAppDispatch();
	const [activeSubTab, setActiveSubTab] = useState<InsightsSubTab>("overview");

	const handleSubTabChange = (value: string) => {
		setActiveSubTab(value as InsightsSubTab);
		dispatch(closeInsightDetail());
	};

	return (
		<TabsContent value="insights" className="mt-0 flex min-h-0 flex-1 flex-col">
			<Tabs
				value={activeSubTab}
				onValueChange={handleSubTabChange}
				className="flex h-full w-full min-h-0 flex-col"
			>
				<div className="my-2 px-4 flex items-center justify-center gap-2">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="composition">Composition</TabsTrigger>
						<TabsTrigger value="relationships">Relationships</TabsTrigger>
						<TabsTrigger value="quality">Quality</TabsTrigger>
					</TabsList>
				</div>

				<OverviewTab />
				<CompositionTab />
				<RelationshipsTab />
				<QualityTab />
			</Tabs>
		</TabsContent>
	);
}
