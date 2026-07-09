import { ArrowRight } from "lucide-react";
import {
	Bar,
	BarChart,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import {
	DEPTH_DISTRIBUTION,
	PATH_DEPTH_STATS,
	TYPE_PATHS,
} from "@/components/explore/insights/deepestPathsData";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const deepestPath = TYPE_PATHS[0];
const maxPathCount = Math.max(
	...DEPTH_DISTRIBUTION.map((row) => row.pathCount),
);

export function DeepestPathsChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "deepestPaths";

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Deepest Nested Paths
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-sm text-card-foreground">
					The deepest path is{" "}
					<span className="font-semibold">{PATH_DEPTH_STATS.max}</span> hops
					deep
				</p>
				<p className="text-sm text-muted-foreground">
					<span className="font-semibold">{PATH_DEPTH_STATS.deepestCount}</span>{" "}
					paths tie at the maximum depth
				</p>
			</div>
			<div className="h-[176px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={DEPTH_DISTRIBUTION}
						layout="vertical"
						margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
					>
						<XAxis type="number" domain={[0, maxPathCount]} hide />
						<YAxis
							type="category"
							dataKey="depth"
							width={72}
							reversed
							axisLine={false}
							tickLine={false}
							tickFormatter={(depth) => `Depth ${depth}`}
							tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
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
						{PATH_DEPTH_STATS.max}
					</span>
				</span>
				<span>
					Total paths:{" "}
					<span className="font-semibold text-card-foreground">
						{PATH_DEPTH_STATS.pathCount}
					</span>
				</span>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-sm text-muted-foreground">
					Example deepest path
				</span>
				<TypePathBreadcrumb segments={deepestPath.segments} maxSegments={5} />
			</div>
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
