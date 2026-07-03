import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

const fieldsByType: { type: string; fieldCount: number }[] = [
	{ type: "Seat", fieldCount: 24 },
	{ type: "Backrest", fieldCount: 12 },
	{ type: "Headrest", fieldCount: 6 },
	{ type: "Vehicle", fieldCount: 4 },
	{ type: "Seating", fieldCount: 3 },
	{ type: "ChargingSession", fieldCount: 3 },
	{ type: "Cabin", fieldCount: 2 },
	{ type: "InCabinArea2x2", fieldCount: 2 },
	{ type: "InCabinArea2x3", fieldCount: 2 },
	{ type: "ManySeatsInstanceTag", fieldCount: 2 },
	{ type: "DrivingJourney", fieldCount: 2 },
	{ type: "SeatOccupancy", fieldCount: 2 },
	{ type: "Airbag", fieldCount: 1 },
	{ type: "VehicleIdentification", fieldCount: 1 },
];

export function FieldsByTypeDetail() {
	return (
		<ul className="flex flex-col gap-2">
			{fieldsByType.map((entry) => (
				<li
					key={entry.type}
					className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
				>
					<TypePathBreadcrumb segments={[entry.type]} />
					<span className="font-bold text-card-foreground">
						{entry.fieldCount}
					</span>
				</li>
			))}
		</ul>
	);
}
