export type ConceptCounts = {
	object: number;
	interface: number;
	enum: number;
	union: number;
	scalar: number;
	input: number;
	field: number;
	leaf_field: number;
	relationship_field: number;
	directive: number;
};

export type ConceptMembers = {
	object: string[];
	interface: string[];
	enum: string[];
	union: string[];
	scalar: string[];
	input: string[];
	directive: string[];
};

export type ContainerKind = "object" | "interface" | "input";

type FieldInfo = {
	name: string;
	type: string;
	is_relationship: boolean;
};

type TypeFields = {
	type: string;
	kind: ContainerKind;
	fields: FieldInfo[];
};

export type EnumValueCount = {
	name: string;
	values: number;
};

export type ScalarUsage = {
	name: string;
	count: number;
	is_builtin: boolean;
};

export type EnumUsage = {
	name: string;
	count: number;
};

export type ConceptsResponse = {
	counts: ConceptCounts;
	members: ConceptMembers;
	fields_by_type: TypeFields[];
	enum_value_counts: EnumValueCount[];
	scalar_usage: ScalarUsage[];
	enum_usage: EnumUsage[];
};
