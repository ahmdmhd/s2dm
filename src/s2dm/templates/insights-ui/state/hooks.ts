import type { InsightsRootState } from "@insights-ui/state/types";
import { useDispatch, useSelector } from "react-redux";

export const useInsightsSelector = useSelector.withTypes<InsightsRootState>();
export const useInsightsDispatch = useDispatch;
