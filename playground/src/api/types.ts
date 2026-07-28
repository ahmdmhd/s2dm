export type ContentInput = {
	type: "content";
	content: string;
};

export type PathInput = {
	type: "path";
	path: string;
};

type FileContentInput = {
	type: "file_content";
	filename: string;
	content: string;
};

type UrlInput = {
	type: "url";
	url: string;
};

export type SchemaInput = ContentInput | FileContentInput | UrlInput;
export type QueryInput = ContentInput;

type SchemasRequest = {
	schemas: SchemaInput[];
};

type SchemasWithSelectionQueryRequest = SchemasRequest & {
	selection_query: QueryInput;
};

export type DependencyConfigEntry = {
	name: string;
	version: string;
	source: string;
	artifact: string;
	selection: ContentInput | PathInput | null;
	schema_content?: string | null;
};

export type DependenciesConfig = {
	dependencies: DependencyConfigEntry[];
};

export type GetDependenciesConfigResponse = DependenciesConfig;

export type SaveDependenciesConfigRequest = DependenciesConfig & {
	config_directory?: string | null;
};

export type DependencyIdentityEntry = {
	host: string;
	scope: string | null;
	token: string;
};

export type DependenciesIdentities = {
	identities: DependencyIdentityEntry[];
};

export type DependencyStatus =
	| "not_configured"
	| "unresolved"
	| "resolved"
	| "invalid";

export type DependenciesStatusResponse = {
	status: DependencyStatus;
};

type ResponseMetadata = {
	result_format: string;
	processing_time_ms?: number;
};

export type ExportResponse = {
	result: string[];
	metadata?: ResponseMetadata;
};

export type ValidateSchemaRequest = SchemasRequest;

export type FilterSchemaRequest = SchemasWithSelectionQueryRequest;

export type OpenAPIPath = {
	"x-exporter-name"?: string;
	"x-cli-command-name"?: string;
	requestBody?: {
		content?: {
			"application/json"?: {
				schema?: {
					$ref?: string;
					properties?: Record<string, unknown>;
					required?: string[];
				};
			};
		};
	};
};

export type OpenAPISpec = {
	paths: Record<string, Record<string, OpenAPIPath>>;
	components?: {
		schemas?: Record<string, unknown>;
	};
};

export type SchemaProperty = {
	type: string;
	title?: string;
	description?: string;
	default?: unknown;
	required: boolean;
	format?: string;
	cliFlagName?: string;
	docsUrl?: string;
};

export type ExporterCapability = {
	name: string;
	endpoint: string;
	requiresSelectionQuery: boolean;
	properties: Record<string, SchemaProperty>;
	propertyValues: Record<string, unknown>;
	cliCommandName: string;
};

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

type QualitySeverity = "warning" | "info";

export type QualityIssue = {
	target: string;
	problem: string;
	severity: QualitySeverity;
	category: string;
};

export type QualityResponse = {
	issues: QualityIssue[];
};
