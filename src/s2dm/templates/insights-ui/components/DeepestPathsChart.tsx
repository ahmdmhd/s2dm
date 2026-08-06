import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectDeepestPath,
	selectDepthDistribution,
	selectPathDepthStats,
} from "@insights-ui/selectors/relationships";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import { formatPathSegments } from "@insights-ui/utils/formatPathSegments";
import pluralize from "pluralize";

const DEPTH_AXIS_WIDTH = 64;

export function DeepestPathsChart() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const depthDistribution = useInsightsSelector(selectDepthDistribution);
	const stats = useInsightsSelector(selectPathDepthStats);
	const deepestPath = useInsightsSelector(selectDeepestPath);
	const selected = selectableCards && detail?.kind === "deepestPaths";

	const hasData = !!stats && depthDistribution.length > 0;
	const maxPathCount = Math.max(
		1,
		...depthDistribution.map((row) => row.pathCount),
	);

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Deepest Nested Paths
			</span>
			{hasData ? (
				<>
					<CardSummary>
						<CardSubtitle>
							The deepest path is{" "}
							<span className="font-semibold">{stats.max}</span>{" "}
							{pluralize("hop", stats.max)} deep
						</CardSubtitle>
						<CardSubtitle muted>
							<span className="font-semibold">{stats.deepestCount}</span>{" "}
							{pluralize("path", stats.deepestCount)}{" "}
							{stats.deepestCount === 1 ? "ties" : "tie"} at the maximum depth
						</CardSubtitle>
					</CardSummary>
					<HorizontalMetricBarChart
						data={depthDistribution}
						categoryKey="depth"
						valueKey="pathCount"
						maxValue={maxPathCount}
						axisWidth={DEPTH_AXIS_WIDTH}
						formatCategory={(depth) => `Depth ${depth}`}
						reversed
					/>
					<div className="flex gap-6 text-sm text-muted-foreground">
						<span>
							Max depth:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.max}
							</span>
						</span>
						<span>
							Total paths:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.pathCount}
							</span>
						</span>
					</div>
					{deepestPath && (
						<div className="flex flex-col gap-2">
							<span className="text-sm text-muted-foreground">
								Example deepest path
							</span>
							<TypePathBreadcrumb
								segments={formatPathSegments(deepestPath.segments)}
								maxSegments={4}
								truncate={false}
							/>
						</div>
					)}
				</>
			) : (
				<CardSubtitle muted>No path depth data available</CardSubtitle>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "deepestPaths" }))}
				/>
			)}
		</HighlightableCard>
	);
}
