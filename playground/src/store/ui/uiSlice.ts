import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import type { RootState } from "@/store/types";

export type ExploreTab = "explorer" | "insights";

export type InsightDetail =
	| { kind: "conceptsBreakdown" }
	| { kind: "conceptDetails"; concept: GraphQLConcept }
	| { kind: "fieldsByKind"; fieldKind: "leaf" | "relationship" }
	| { kind: "enumsList" }
	| { kind: "fieldsByType" }
	| { kind: "fieldsByTypeList" }
	| { kind: "deepestPaths" }
	| { kind: "pathsByDepth"; depth: number }
	| { kind: "undocumented" }
	| { kind: "undocumentedList"; entityKind: string };

export interface UIState {
	panes: {
		input: {
			isCollapsed: boolean;
		};
		result: {
			isCollapsed: boolean;
		};
	};
	exploreTab: ExploreTab;
	insightDetailStack: InsightDetail[];
}

const initialState: UIState = {
	panes: {
		input: {
			isCollapsed: false,
		},
		result: {
			isCollapsed: true,
		},
	},
	exploreTab: "explorer",
	insightDetailStack: [],
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		toggleInputPane: (state) => {
			state.panes.input.isCollapsed = !state.panes.input.isCollapsed;
		},
		toggleResultPane: (state) => {
			state.panes.result.isCollapsed = !state.panes.result.isCollapsed;
		},
		collapseResultPane: (state) => {
			state.panes.result.isCollapsed = true;
		},
		setExploreTab: (state, action: PayloadAction<ExploreTab>) => {
			state.exploreTab = action.payload;
			state.insightDetailStack = [];
		},
		openInsightDetail: (state, action: PayloadAction<InsightDetail>) => {
			state.insightDetailStack = [action.payload];
			state.panes.result.isCollapsed = false;
		},
		pushInsightDetail: (state, action: PayloadAction<InsightDetail>) => {
			state.insightDetailStack.push(action.payload);
			state.panes.result.isCollapsed = false;
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
	toggleInputPane,
	toggleResultPane,
	collapseResultPane,
	setExploreTab,
	openInsightDetail,
	pushInsightDetail,
	popInsightDetail,
	closeInsightDetail,
} = uiSlice.actions;

export const selectInputPaneCollapsed = (state: RootState) =>
	state.ui.panes.input.isCollapsed;
export const selectResultPaneCollapsed = (state: RootState) =>
	state.ui.panes.result.isCollapsed;
export const selectExploreTab = (state: RootState) => state.ui.exploreTab;
export const selectInsightDetail = (state: RootState) =>
	state.ui.insightDetailStack.at(-1) ?? null;
export const selectCanGoBackInsightDetail = (state: RootState) =>
	state.ui.insightDetailStack.length > 1;

export default uiSlice.reducer;
