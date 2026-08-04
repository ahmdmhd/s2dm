import type { InsightsState } from "@/store/insights/insightsSlice";
import type { UIState } from "@/store/ui/uiSlice";

export type RootState = {
	insights: InsightsState;
	ui: UIState;
};
