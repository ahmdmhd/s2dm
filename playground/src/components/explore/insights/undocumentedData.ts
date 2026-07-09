export type UndocumentedElement = {
	name: string;
	kind: string;
};

export const UNDOCUMENTED_ELEMENTS: UndocumentedElement[] = [
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

export type UndocumentedKindGroup = {
	kind: string;
	elements: UndocumentedElement[];
};

function groupByKind(elements: UndocumentedElement[]): UndocumentedKindGroup[] {
	const elementsByKind = new Map<string, UndocumentedElement[]>();
	for (const element of elements) {
		const group = elementsByKind.get(element.kind) ?? [];
		group.push(element);
		elementsByKind.set(element.kind, group);
	}
	return Array.from(elementsByKind, ([kind, kindElements]) => ({
		kind,
		elements: kindElements,
	}));
}

export const UNDOCUMENTED_BY_KIND = groupByKind(UNDOCUMENTED_ELEMENTS);
