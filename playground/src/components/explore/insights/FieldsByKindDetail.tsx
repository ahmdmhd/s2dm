import { ArrowRight } from "lucide-react";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

export type FieldWithType = { field: string; target: string };

export const LEAF_FIELDS: FieldWithType[] = [
	{ field: "InCabinArea2x2.row", target: "TwoRowsInCabinEnum" },
	{ field: "InCabinArea2x2.column", target: "TwoColumnsInCabinEnum" },
	{ field: "InCabinArea2x3.row", target: "TwoRowsInCabinEnum" },
	{ field: "InCabinArea2x3.column", target: "ThreeColumnsInCabinEnum" },
	{ field: "InCabinArea2x2Input.row", target: "TwoRowsInCabinEnum" },
	{ field: "InCabinArea2x2Input.column", target: "TwoColumnsInCabinEnum" },
	{ field: "InCabinArea2x3Input.row", target: "TwoRowsInCabinEnum" },
	{ field: "InCabinArea2x3Input.column", target: "ThreeColumnsInCabinEnum" },
	{ field: "Cabin.driverPosition", target: "DriverPositionEnum" },
	{ field: "ManySeatsInstanceTag.row", target: "TenRowsInCabinEnum" },
	{ field: "ManySeatsInstanceTag.column", target: "ThreeColumnsInCabinEnum" },
	{ field: "Person.name", target: "String!" },
	{ field: "chargingStation.id", target: "ID!" },
	{ field: "Seat.heatingCooling", target: "Int8" },
	{ field: "Seat.height", target: "UInt16" },
	{ field: "Seat.isBackwardSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isBelted", target: "Boolean" },
	{ field: "Seat.isCoolerSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isDecreaseMassageLevelSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isDownSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isForwardSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isIncreaseMassageLevelSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isOccupied", target: "Boolean" },
	{ field: "Seat.isTiltBackwardSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isTiltForwardSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isUpSwitchEngaged", target: "Boolean" },
	{ field: "Seat.isWarmerSwitchEngaged", target: "Boolean" },
	{ field: "Seat.massage", target: "UInt8" },
	{ field: "Seat.massageLevel", target: "UInt8" },
	{ field: "Seat.position", target: "UInt16" },
	{ field: "Seat.seatBeltHeight", target: "UInt16" },
	{ field: "Seat.tilt", target: "Float" },
	{ field: "Airbag.isDeployed", target: "Boolean" },
	{ field: "Backrest.isLessLumbarSupportSwitchEngaged", target: "Boolean" },
	{
		field: "Backrest.isLessSideBolsterSupportSwitchEngaged",
		target: "Boolean",
	},
	{ field: "Backrest.isLumbarDownSwitchEngaged", target: "Boolean" },
	{ field: "Backrest.isLumbarUpSwitchEngaged", target: "Boolean" },
	{ field: "Backrest.isMoreLumbarSupportSwitchEngaged", target: "Boolean" },
	{
		field: "Backrest.isMoreSideBolsterSupportSwitchEngaged",
		target: "Boolean",
	},
	{ field: "Backrest.isReclineBackwardSwitchEngaged", target: "Boolean" },
	{ field: "Backrest.isReclineForwardSwitchEngaged", target: "Boolean" },
	{ field: "Backrest.lumbarHeight", target: "UInt8" },
	{ field: "Backrest.lumbarSupport", target: "Float" },
	{ field: "Backrest.recline", target: "Float" },
	{ field: "Backrest.sideBolsterSupport", target: "Float" },
	{ field: "Headrest.angle", target: "Float" },
	{ field: "Headrest.height", target: "UInt8" },
	{ field: "Headrest.isBackwardSwitchEngaged", target: "Boolean" },
	{ field: "Headrest.isDownSwitchEngaged", target: "Boolean" },
	{ field: "Headrest.isForwardSwitchEngaged", target: "Boolean" },
	{ field: "Headrest.isUpSwitchEngaged", target: "Boolean" },
	{ field: "Seating.isBackwardSwitchEngaged", target: "Boolean" },
	{ field: "Seating.isForwardSwitchEngaged", target: "Boolean" },
	{ field: "Seating.length", target: "UInt16" },
	{ field: "VehicleIdentification.vin", target: "String!" },
];

export const RELATIONSHIP_FIELDS: FieldWithType[] = [
	{ field: "Cabin.seats", target: "[Seat]" },
	{ field: "DrivingJourney.vehicle", target: "Vehicle!" },
	{ field: "DrivingJourney.occupants", target: "[SeatOccupancy]" },
	{ field: "SeatOccupancy.occupant", target: "Person!" },
	{ field: "SeatOccupancy.seat", target: "Seat!" },
	{ field: "ChargingSession.vehicle", target: "Vehicle!" },
	{ field: "ChargingSession.paidBy", target: "Person" },
	{ field: "ChargingSession.chargingStation", target: "chargingStation" },
	{ field: "Seat.airbag", target: "Airbag" },
	{ field: "Seat.backrest", target: "Backrest" },
	{ field: "Seat.headrest", target: "Headrest" },
	{ field: "Seat.seating", target: "Seating" },
	{ field: "Seat.instanceTag", target: "ManySeatsInstanceTag" },
	{ field: "Vehicle.id", target: "VehicleIdentification!" },
	{ field: "Vehicle.cabin", target: "Cabin" },
	{ field: "Vehicle.journeyHistory", target: "[DrivingJourney!]" },
	{ field: "Vehicle.chargingHistory", target: "[ChargingSession!]" },
];

export function FieldTypeRow({ field, target }: FieldWithType) {
	return (
		<div className="flex items-center gap-2">
			<TypePathBreadcrumb segments={field.split(".")} />
			<ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
			<span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-card-foreground">
				{target}
			</span>
		</div>
	);
}

type FieldsByKindDetailProps = {
	fieldKind: "leaf" | "relationship";
};

export function FieldsByKindDetail({ fieldKind }: FieldsByKindDetailProps) {
	const fields =
		fieldKind === "relationship" ? RELATIONSHIP_FIELDS : LEAF_FIELDS;

	return (
		<div className="flex flex-col gap-2">
			{fields.map((entry) => (
				<FieldTypeRow key={entry.field} {...entry} />
			))}
		</div>
	);
}
