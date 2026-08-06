import type { GraphQLConcept } from "@insights-ui/components/graphqlConceptStyles";
import type { InsightsRootState } from "@insights-ui/state/types";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export type InsightsSubTab =
	| "overview"
	| "composition"
	| "relationships"
	| "quality";

export type InsightDetail =
	| { kind: "conceptsBreakdown" }
	| { kind: "conceptDetails"; concept: GraphQLConcept }
	| { kind: "fieldsByKind"; fieldKind: "leaf" | "relationship" }
	| { kind: "enumsList" }
	| { kind: "fieldsByType" }
	| { kind: "fieldsByTypeList" }
	| { kind: "scalarDistribution" }
	| { kind: "scalarDistributionList" }
	| { kind: "enumUsage" }
	| { kind: "enumUsageList" }
	| { kind: "references" }
	| { kind: "referencesList" }
	| { kind: "deepestPaths" }
	| { kind: "pathsByDepth"; depth: number }
	| { kind: "cyclicReferences" }
	| { kind: "undocumented" }
	| { kind: "undocumentedList"; entityKind: string }
	| { kind: "unused" }
	| { kind: "unusedList"; category: string }
	| { kind: "missingUnits" }
	| { kind: "missingUnitsList" };

export interface InsightDetailState {
	insightsSubTab: InsightsSubTab | null;
	insightDetailStack: InsightDetail[];
}

const initialState: InsightDetailState = {
	insightsSubTab: null,
	insightDetailStack: [],
};

const insightDetailSlice = createSlice({
	name: "insightDetail",
	initialState,
	reducers: {
		setInsightsSubTab: (state, action: PayloadAction<InsightsSubTab>) => {
			state.insightsSubTab = action.payload;
			state.insightDetailStack = [];
		},
		clearInsightsSubTab: (state) => {
			state.insightsSubTab = null;
		},
		openInsightDetail: (state, action: PayloadAction<InsightDetail>) => {
			state.insightDetailStack = [action.payload];
		},
		pushInsightDetail: (state, action: PayloadAction<InsightDetail>) => {
			state.insightDetailStack.push(action.payload);
		},
		popInsightDetail: (state) => {
			state.insightDetailStack.pop();
		},
		closeInsightDetail: (state) => {
			state.insightDetailStack = [];
		},
	},
});

export const {
	setInsightsSubTab,
	clearInsightsSubTab,
	openInsightDetail,
	pushInsightDetail,
	popInsightDetail,
	closeInsightDetail,
} = insightDetailSlice.actions;

export const selectInsightsSubTab = (state: InsightsRootState) =>
	state.insightDetail.insightsSubTab;
export const selectInsightDetail = (state: InsightsRootState) =>
	state.insightDetail.insightDetailStack.at(-1) ?? null;
export const selectCanGoBackInsightDetail = (state: InsightsRootState) =>
	state.insightDetail.insightDetailStack.length > 1;

export default insightDetailSlice.reducer;
