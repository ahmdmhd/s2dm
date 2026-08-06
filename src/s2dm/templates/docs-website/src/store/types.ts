import type { InsightDetailState } from "@insights-ui/state/insightDetailSlice";
import type { InsightsState } from "@insights-ui/state/insightsSlice";

export type RootState = {
	insights: InsightsState;
	insightDetail: InsightDetailState;
};
