import type { InsightDetailState } from "@insights-ui/state/insightDetailSlice";
import type { InsightsState } from "@insights-ui/state/insightsSlice";

/**
 * The store shape the shared insights selectors and components read from.
 *
 * Each host declares its own, larger `RootState`. Because that shape structurally
 * satisfies this one, host-typed hooks accept the shared selectors and vice versa.
 */
export type InsightsRootState = {
	insights: InsightsState;
	insightDetail: InsightDetailState;
};
