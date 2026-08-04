import pluralize from "pluralize";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { HorizontalMetricBarChart } from "@/components/explore/insights/HorizontalMetricBarChart";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { useAppSelector } from "@/store/hooks";
import {
	selectDeepestPath,
	selectDepthDistribution,
	selectPathDepthStats,
} from "@/store/insights/insightsSelectors";
import { formatPathSegments } from "@/utils/formatPathSegments";

const DEPTH_AXIS_WIDTH = 64;

export function DeepestPathsChart() {
	const depthDistribution = useAppSelector(selectDepthDistribution);
	const stats = useAppSelector(selectPathDepthStats);
	const deepestPath = useAppSelector(selectDeepestPath);

	const hasData = !!stats && depthDistribution.length > 0;
	const maxPathCount = Math.max(
		1,
		...depthDistribution.map((row) => row.pathCount),
	);

	return (
		<HighlightableCard>
			<span className="text-lg font-semibold text-card-foreground">
				Deepest Nested Paths
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							The deepest path is{" "}
							<span className="font-semibold">{stats.max}</span>{" "}
							{pluralize("hop", stats.max)} deep
						</p>
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{stats.deepestCount}</span>{" "}
							{pluralize("path", stats.deepestCount)}{" "}
							{stats.deepestCount === 1 ? "ties" : "tie"} at the maximum depth
						</p>
					</div>
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
				<p className="text-sm text-muted-foreground">
					No path depth data available
				</p>
			)}
		</HighlightableCard>
	);
}
