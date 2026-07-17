import { ArrowRight } from "lucide-react";
import {
	Bar,
	BarChart,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { CategoryTick } from "@/components/explore/insights/CategoryTick";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectDeepestPath,
	selectDepthDistribution,
	selectPathDepthStats,
} from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const DEPTH_AXIS_WIDTH = 64;

export function DeepestPathsChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const depthDistribution = useAppSelector(selectDepthDistribution);
	const stats = useAppSelector(selectPathDepthStats);
	const deepestPath = useAppSelector(selectDeepestPath);
	const selected = detail?.kind === "deepestPaths";

	if (!stats || depthDistribution.length === 0) {
		return null;
	}

	const maxPathCount = Math.max(
		...depthDistribution.map((row) => row.pathCount),
	);

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Deepest Nested Paths
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-sm text-card-foreground">
					The deepest path is <span className="font-semibold">{stats.max}</span>{" "}
					hops deep
				</p>
				<p className="text-sm text-muted-foreground">
					<span className="font-semibold">{stats.deepestCount}</span> paths tie
					at the maximum depth
				</p>
			</div>
			<div className="h-[176px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={depthDistribution}
						layout="vertical"
						margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
					>
						<XAxis type="number" domain={[0, maxPathCount]} hide />
						<YAxis
							type="category"
							dataKey="depth"
							width={DEPTH_AXIS_WIDTH}
							reversed
							axisLine={false}
							tickLine={false}
							tick={
								<CategoryTick
									width={DEPTH_AXIS_WIDTH}
									format={(depth) => `Depth ${depth}`}
								/>
							}
						/>
						<Bar
							dataKey="pathCount"
							fill="var(--color-blue-500)"
							radius={[0, 4, 4, 0]}
							barSize={16}
						>
							<LabelList
								dataKey="pathCount"
								position="right"
								fill="var(--color-card-foreground)"
								fontSize={12}
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
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
						segments={deepestPath.segments}
						truncate={false}
					/>
				</div>
			)}
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "deepestPaths" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
