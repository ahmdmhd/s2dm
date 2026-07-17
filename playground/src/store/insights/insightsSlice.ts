import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
	ConceptsResponse,
	CoverageResponse,
	QualityResponse,
	RelationshipsResponse,
} from "@/api/types";
import type { RootState } from "@/store/types";

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

export const selectInsightsConcepts = (state: RootState) =>
	state.insights.concepts;
export const selectInsightsRelationships = (state: RootState) =>
	state.insights.relationships;
export const selectInsightsCoverage = (state: RootState) =>
	state.insights.coverage;
export const selectInsightsQuality = (state: RootState) =>
	state.insights.quality;
export const selectIsLoadingInsights = (state: RootState) =>
	state.insights.isLoading;
export const selectInsightsError = (state: RootState) => state.insights.error;

export default insightsSlice.reducer;
