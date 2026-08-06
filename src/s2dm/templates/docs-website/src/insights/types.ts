import type { ConceptsResponse } from "@insights-ui/types/concepts";
import type { CoverageResponse } from "@insights-ui/types/coverage";
import type { QualityResponse } from "@insights-ui/types/quality";
import type { RelationshipsResponse } from "@insights-ui/types/relationships";

export type InsightsBundle = {
	concepts: ConceptsResponse;
	relationships: RelationshipsResponse;
	coverage: CoverageResponse;
	quality: QualityResponse;
};
