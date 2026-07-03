import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import type { RootState } from "@/store/types";

export type ExploreTab = "explorer" | "insights";

export type InsightDetail =
	| { kind: "conceptDetails"; concept: GraphQLConcept }
	| { kind: "allIssues" }
	| { kind: "fieldsByType" }
	| { kind: "deepestPaths" }
	| { kind: "undocumented" };

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
	selectedInsightDetail: InsightDetail | null;
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
	selectedInsightDetail: null,
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
		setExploreTab: (state, action: PayloadAction<ExploreTab>) => {
			state.exploreTab = action.payload;
			state.selectedInsightDetail = null;
		},
		openInsightDetail: (state, action: PayloadAction<InsightDetail>) => {
			state.selectedInsightDetail = action.payload;
			state.panes.result.isCollapsed = false;
		},
		closeInsightDetail: (state) => {
			state.selectedInsightDetail = null;
		},
	},
});

export const {
	toggleInputPane,
	toggleResultPane,
	setExploreTab,
	openInsightDetail,
	closeInsightDetail,
} = uiSlice.actions;

export const selectInputPaneCollapsed = (state: RootState) =>
	state.ui.panes.input.isCollapsed;
export const selectResultPaneCollapsed = (state: RootState) =>
	state.ui.panes.result.isCollapsed;
export const selectExploreTab = (state: RootState) => state.ui.exploreTab;
export const selectInsightDetail = (state: RootState) =>
	state.ui.selectedInsightDetail;

export default uiSlice.reducer;
