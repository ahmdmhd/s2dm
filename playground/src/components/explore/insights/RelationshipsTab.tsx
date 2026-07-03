import {
	type DeepestPath,
	DeepestPathsCard,
} from "@/components/explore/insights/DeepestPathsCard";
import { MaxDepthCard } from "@/components/explore/insights/MaxDepthCard";
import { TabsContent } from "@/components/ui/tabs";

const deepestPaths: DeepestPath[] = [
	{
		segments: [
			"Vehicle",
			"DrivingJourney",
			"SeatOccupancy",
			"Seat",
			"Backrest",
		],
		depth: 5,
	},
	{
		segments: [
			"Vehicle",
			"DrivingJourney",
			"SeatOccupancy",
			"Seat",
			"Headrest",
		],
		depth: 5,
	},
	{
		segments: ["Vehicle", "DrivingJourney", "SeatOccupancy", "Seat", "Airbag"],
		depth: 5,
	},
	{ segments: ["Vehicle", "Cabin", "Seat", "Backrest"], depth: 4 },
	{
		segments: ["Vehicle", "DrivingJourney", "SeatOccupancy", "Person"],
		depth: 4,
	},
];

export function RelationshipsTab() {
	return (
		<TabsContent
			value="relationships"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
				<DeepestPathsCard paths={deepestPaths} />
				<MaxDepthCard deepestPath={deepestPaths[0]} />
			</div>
		</TabsContent>
	);
}
