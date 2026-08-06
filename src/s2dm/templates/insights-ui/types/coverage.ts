type CoverageCount = {
	documented: number;
	total: number;
};

type CoverageBreakdown = {
	types: CoverageCount;
	fields: CoverageCount;
	enums: CoverageCount;
	enum_values: CoverageCount;
	directives: CoverageCount;
};

export type UndocumentedEntity = {
	name: string;
	kind: string;
};

export type CoverageResponse = {
	breakdown: CoverageBreakdown;
	undocumented: UndocumentedEntity[];
};
