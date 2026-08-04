import { configureStore } from "@reduxjs/toolkit";
import type { InsightsBundle } from "@/insights/types";
import insightsReducer, {
	type InsightsState,
} from "@/store/insights/insightsSlice";
import uiReducer from "@/store/ui/uiSlice";

export function createInsightsStore(bundle: InsightsBundle) {
	const insights: InsightsState = {
		...bundle,
		isLoading: false,
		error: null,
	};

	return configureStore({
		reducer: {
			insights: insightsReducer,
			ui: uiReducer,
		},
		preloadedState: { insights },
	});
}

export type InsightsStore = ReturnType<typeof createInsightsStore>;
export type AppDispatch = InsightsStore["dispatch"];
