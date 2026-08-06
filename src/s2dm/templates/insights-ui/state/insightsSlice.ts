import type { InsightsRootState } from "@insights-ui/state/types";
import type { ConceptsResponse } from "@insights-ui/types/concepts";
import type { CoverageResponse } from "@insights-ui/types/coverage";
import type { QualityResponse } from "@insights-ui/types/quality";
import type { RelationshipsResponse } from "@insights-ui/types/relationships";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface InsightsState {
	concepts: ConceptsResponse | null;
	relationships: RelationshipsResponse | null;
	coverage: CoverageResponse | null;
	quality: QualityResponse | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: InsightsState = {
	concepts: null,
	relationships: null,
	coverage: null,
	quality: null,
	isLoading: false,
	error: null,
};

type FetchInsightsSuccessPayload = {
	concepts: ConceptsResponse;
	relationships: RelationshipsResponse;
	coverage: CoverageResponse;
	quality: QualityResponse;
};

const insightsSlice = createSlice({
	name: "insights",
	initialState,
	reducers: {
		fetchInsights: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		fetchInsightsSuccess: (
			state,
			action: PayloadAction<FetchInsightsSuccessPayload>,
		) => {
			state.isLoading = false;
			state.concepts = action.payload.concepts;
			state.relationships = action.payload.relationships;
			state.coverage = action.payload.coverage;
			state.quality = action.payload.quality;
			state.error = null;
		},
		fetchInsightsFailure: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const { fetchInsights, fetchInsightsSuccess, fetchInsightsFailure } =
	insightsSlice.actions;

export const selectInsightsConcepts = (state: InsightsRootState) =>
	state.insights.concepts;
export const selectInsightsRelationships = (state: InsightsRootState) =>
	state.insights.relationships;
export const selectInsightsCoverage = (state: InsightsRootState) =>
	state.insights.coverage;
export const selectInsightsQuality = (state: InsightsRootState) =>
	state.insights.quality;
export const selectIsLoadingInsights = (state: InsightsRootState) =>
	state.insights.isLoading;
export const selectInsightsError = (state: InsightsRootState) =>
	state.insights.error;

export default insightsSlice.reducer;
