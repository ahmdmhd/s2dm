import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

const deepestPaths: { segments: string[]; depth: number }[] = [
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
	{ segments: ["Vehicle", "Cabin", "Seat", "Headrest"], depth: 4 },
	{
		segments: ["Vehicle", "DrivingJourney", "SeatOccupancy", "Person"],
		depth: 4,
	},
	{ segments: ["Vehicle", "ChargingSession", "chargingStation"], depth: 3 },
	{ segments: ["Vehicle", "ChargingSession", "Person"], depth: 3 },
];

export function DeepestPathsDetail() {
	return (
		<div className="flex flex-col gap-3">
			{deepestPaths.map((path) => (
				<div
					key={path.segments.join(">")}
					className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2"
				>
					<TypePathBreadcrumb segments={path.segments} />
					<span className="text-sm font-bold text-card-foreground">
						{path.depth}
					</span>
				</div>
			))}
		</div>
	);
}
