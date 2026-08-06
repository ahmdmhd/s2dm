export type PathSegment = {
	type: string;
	field: string | null;
	field_type: string | null;
};

export type RelationshipPath = {
	segments: PathSegment[];
	depth: number;
};

export type CyclicReference = {
	segments: PathSegment[];
	length: number;
};

type DepthCount = {
	depth: number;
	count: number;
};

export type ReferenceCount = {
	name: string;
	count: number;
};

export type RelationshipsResponse = {
	paths: RelationshipPath[];
	max_depth: RelationshipPath | null;
	total_paths: number;
	depth_distribution: DepthCount[];
	cyclic_references: CyclicReference[];
	reference_counts: ReferenceCount[];
};
