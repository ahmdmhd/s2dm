import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import type { RootState } from "@/store/types";

export type InsightsSubTab =
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

export interface UIState {
	insightsSubTab: InsightsSubTab | null;
	insightDetailStack: InsightDetail[];
}

const initialState: UIState = {
	insightsSubTab: null,
	insightDetailStack: [],
};

const uiSlice = createSlice({
	name: "ui",
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
} = uiSlice.actions;

export const selectInsightsSubTab = (state: RootState) =>
	state.ui.insightsSubTab;
export const selectInsightDetail = (state: RootState) =>
	state.ui.insightDetailStack.at(-1) ?? null;
export const selectCanGoBackInsightDetail = (state: RootState) =>
	state.ui.insightDetailStack.length > 1;

export default uiSlice.reducer;
