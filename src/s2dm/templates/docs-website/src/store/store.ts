import insightDetailReducer from "@insights-ui/state/insightDetailSlice";
import insightsReducer, {
	type InsightsState,
} from "@insights-ui/state/insightsSlice";
import { configureStore } from "@reduxjs/toolkit";
import type { InsightsBundle } from "@/insights/types";

export function createInsightsStore(bundle: InsightsBundle) {
	const insights: InsightsState = {
		...bundle,
		isLoading: false,
		error: null,
	};

	return configureStore({
		reducer: {
			insights: insightsReducer,
			insightDetail: insightDetailReducer,
		},
		preloadedState: { insights },
	});
}

export type InsightsStore = ReturnType<typeof createInsightsStore>;
export type AppDispatch = InsightsStore["dispatch"];
