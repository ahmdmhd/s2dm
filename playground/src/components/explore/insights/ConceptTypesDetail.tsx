import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

const MOCK_CONCEPT_MEMBERS: Record<
	Exclude<GraphQLConcept, "field">,
	string[]
> = {
	object: [
		"Vehicle",
		"Cabin",
		"Seat",
		"Backrest",
		"Headrest",
		"Seating",
		"Airbag",
		"DrivingJourney",
		"SeatOccupancy",
		"ChargingSession",
		"Person",
	],
	interface: ["Component", "Identifiable", "Signal"],
	enum: [
		"DriverPositionEnum",
		"TwoRowsInCabinEnum",
		"ThreeColumnsInCabinEnum",
		"LengthUnitEnum",
		"Relation_Unit_Enum",
		"Duration_Unit_Enum",
	],
	union: ["Occupant", "CabinComponent"],
	scalar: ["Int8", "UInt8", "Int16", "UInt16", "UInt32", "Int64", "UInt64"],
	input: ["InCabinArea2x2Input", "InCabinArea2x3Input"],
	directive: [
		"@range",
		"@cardinality",
		"@noDuplicates",
		"@instanceTag",
		"@metadata",
	],
};

const MOCK_FIELD_GROUPS: { type: string; fields: string[] }[] = [
	{
		type: "Seat",
		fields: [
			"heatingCooling",
			"height",
			"isBackwardSwitchEngaged",
			"isBelted",
			"isCoolerSwitchEngaged",
			"isDecreaseMassageLevelSwitchEngaged",
			"isDownSwitchEngaged",
			"isForwardSwitchEngaged",
			"isIncreaseMassageLevelSwitchEngaged",
			"isOccupied",
			"isTiltBackwardSwitchEngaged",
			"isTiltForwardSwitchEngaged",
			"isUpSwitchEngaged",
			"isWarmerSwitchEngaged",
			"massage",
			"massageLevel",
			"position",
			"seatBeltHeight",
			"tilt",
			"airbag",
			"backrest",
			"headrest",
			"seating",
			"instanceTag",
		],
	},
	{
		type: "Backrest",
		fields: [
			"isLessLumbarSupportSwitchEngaged",
			"isLessSideBolsterSupportSwitchEngaged",
			"isLumbarDownSwitchEngaged",
			"isLumbarUpSwitchEngaged",
			"isMoreLumbarSupportSwitchEngaged",
			"isMoreSideBolsterSupportSwitchEngaged",
			"isReclineBackwardSwitchEngaged",
			"isReclineForwardSwitchEngaged",
			"lumbarHeight",
			"lumbarSupport",
			"recline",
			"sideBolsterSupport",
		],
	},
	{
		type: "Headrest",
		fields: [
			"angle",
			"height",
			"isBackwardSwitchEngaged",
			"isDownSwitchEngaged",
			"isForwardSwitchEngaged",
			"isUpSwitchEngaged",
		],
	},
	{
		type: "Vehicle",
		fields: ["id", "cabin", "journeyHistory", "chargingHistory"],
	},
	{
		type: "Seating",
		fields: ["isBackwardSwitchEngaged", "isForwardSwitchEngaged", "length"],
	},
	{ type: "ChargingSession", fields: ["vehicle", "paidBy", "chargingStation"] },
	{ type: "Cabin", fields: ["seats", "driverPosition"] },
	{ type: "InCabinArea2x2", fields: ["row", "column"] },
	{ type: "InCabinArea2x3", fields: ["row", "column"] },
	{ type: "ManySeatsInstanceTag", fields: ["row", "column"] },
	{ type: "DrivingJourney", fields: ["vehicle", "occupants"] },
	{ type: "SeatOccupancy", fields: ["occupant", "seat"] },
	{ type: "Query", fields: ["vehicle", "seat"] },
	{ type: "Airbag", fields: ["isDeployed"] },
	{ type: "VehicleIdentification", fields: ["vin"] },
	{ type: "Person", fields: ["name"] },
	{ type: "chargingStation", fields: ["id"] },
];

type ConceptTypesDetailProps = {
	concept: GraphQLConcept;
};

export function ConceptTypesDetail({ concept }: ConceptTypesDetailProps) {
	if (concept === "field") {
		return (
			<div className="flex flex-col gap-2 text-sm">
				{MOCK_FIELD_GROUPS.map((group) => (
					<div
						key={group.type}
						className="flex flex-col gap-2 rounded-md border border-border px-3 py-2"
					>
						<div>
							<TypePathBreadcrumb segments={[group.type]} tone="emphasis" />
						</div>
						{group.fields.map((field) => (
							<div key={field} className="flex items-center gap-1 pl-3">
								<span className="text-muted-foreground">└</span>
								<TypePathBreadcrumb segments={[field]} />
							</div>
						))}
					</div>
				))}
			</div>
		);
	}

	const members = MOCK_CONCEPT_MEMBERS[concept];

	return (
		<ul className="flex flex-col gap-2">
			{members.map((member) => (
				<li
					key={member}
					className="rounded-md border border-border px-3 py-2 text-sm"
				>
					<TypePathBreadcrumb segments={[member]} />
				</li>
			))}
		</ul>
	);
}
