import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

const undocumented: { name: string; kind: string }[] = [
	{ name: "TwoRowsInCabinEnum", kind: "Enum" },
	{ name: "LengthUnitEnum", kind: "Enum" },
	{ name: "Relation_Unit_Enum", kind: "Enum" },
	{ name: "Work_Unit_Enum", kind: "Enum" },
	{ name: "Person", kind: "Object" },
	{ name: "ChargingSession", kind: "Object" },
	{ name: "Seat.airbag", kind: "Field" },
	{ name: "Vehicle.journeyHistory", kind: "Field" },
	{ name: "Int8", kind: "Scalar" },
];

export function UndocumentedDetail() {
	return (
		<ul className="flex flex-col gap-2">
			{undocumented.map((entry) => (
				<li
					key={`${entry.kind}:${entry.name}`}
					className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
				>
					<TypePathBreadcrumb segments={entry.name.split(".")} />
					<span className="shrink-0 text-xs text-muted-foreground">
						{entry.kind}
					</span>
				</li>
			))}
		</ul>
	);
}
