import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

export type EnumEntry = { name: string; values: number };

export const ENUMS: EnumEntry[] = [
	{ name: "TenRowsInCabinEnum", values: 10 },
	{ name: "Duration_Unit_Enum", values: 8 },
	{ name: "LengthUnitEnum", values: 5 },
	{ name: "Relation_Unit_Enum", values: 5 },
	{ name: "Pressure_Unit_Enum", values: 4 },
	{ name: "DriverPositionEnum", values: 3 },
	{ name: "Frequency_Unit_Enum", values: 3 },
	{ name: "Mass_Unit_Enum", values: 3 },
	{ name: "Power_Unit_Enum", values: 3 },
	{ name: "ThreeColumnsInCabinEnum", values: 3 },
	{ name: "Volume_Unit_Enum", values: 3 },
	{ name: "Acceleration_Unit_Enum", values: 2 },
	{ name: "Angularspeed_Unit_Enum", values: 2 },
	{ name: "Datetime_Unit_Enum", values: 2 },
	{ name: "Distancepervolume_Unit_Enum", values: 2 },
	{ name: "Energyconsumptionperdistance_Unit_Enum", values: 2 },
	{ name: "Force_Unit_Enum", values: 2 },
	{ name: "TwoColumnsInCabinEnum", values: 2 },
	{ name: "TwoRowsInCabinEnum", values: 2 },
	{ name: "Velocity_Unit_Enum", values: 2 },
	{ name: "Volumeperdistance_Unit_Enum", values: 2 },
	{ name: "Angle_Unit_Enum", values: 1 },
	{ name: "Electriccharge_Unit_Enum", values: 1 },
	{ name: "Electriccurrent_Unit_Enum", values: 1 },
	{ name: "Illuminance_Unit_Enum", values: 1 },
	{ name: "Massperdistance_Unit_Enum", values: 1 },
	{ name: "Masspertime_Unit_Enum", values: 1 },
	{ name: "Rating_Unit_Enum", values: 1 },
	{ name: "Resistance_Unit_Enum", values: 1 },
	{ name: "Rotationalspeed_Unit_Enum", values: 1 },
	{ name: "Temperature_Unit_Enum", values: 1 },
	{ name: "Torque_Unit_Enum", values: 1 },
	{ name: "Voltage_Unit_Enum", values: 1 },
	{ name: "Volumeflowrate_Unit_Enum", values: 1 },
	{ name: "Work_Unit_Enum", values: 1 },
];

export function EnumRow({ name, values, rank }: EnumEntry & { rank?: string }) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
			<div className="flex min-w-0 items-center gap-2">
				{rank && (
					<span className="text-xs font-medium text-muted-foreground">
						({rank})
					</span>
				)}
				<TypePathBreadcrumb segments={[name]} />
			</div>
			<span className="shrink-0 font-medium text-card-foreground">
				{values} values
			</span>
		</div>
	);
}

export function EnumsDetail() {
	return (
		<div className="flex flex-col gap-2">
			{ENUMS.map((entry) => (
				<EnumRow key={entry.name} {...entry} />
			))}
		</div>
	);
}
