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
	selectCycleLengthDistribution,
	selectCyclicReferenceStats,
	selectShortestCycle,
} from "@/store/insights/insightsSelectors";
import { selectInsightsRelationships } from "@/store/insights/insightsSlice";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const LENGTH_AXIS_WIDTH = 64;

export function CyclicReferencesChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const relationships = useAppSelector(selectInsightsRelationships);
	const lengthDistribution = useAppSelector(selectCycleLengthDistribution);
	const stats = useAppSelector(selectCyclicReferenceStats);
	const shortestCycle = useAppSelector(selectShortestCycle);
	const selected = detail?.kind === "cyclicReferences";

	const hasData = !!relationships;
	const cycleCount = stats?.cycleCount ?? 0;
	const maxCycleCount = stats
		? Math.max(1, ...lengthDistribution.map((row) => row.cycleCount))
		: 0;

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Cyclic References
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							<span className="font-semibold">{cycleCount}</span> cyclic
							references were detected
						</p>
						{stats ? (
							<p className="text-sm text-muted-foreground">
								The shortest cycle is{" "}
								<span className="font-semibold">{stats.shortest}</span> hops
								long
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No reference loops were found in the model
							</p>
						)}
					</div>
					{stats && (
						<>
							<div className="h-[176px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={lengthDistribution}
										layout="vertical"
										margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
									>
										<XAxis type="number" domain={[0, maxCycleCount]} hide />
										<YAxis
											type="category"
											dataKey="length"
											width={LENGTH_AXIS_WIDTH}
											axisLine={false}
											tickLine={false}
											tick={
												<CategoryTick
													width={LENGTH_AXIS_WIDTH}
													format={(length) => `Length ${length}`}
												/>
											}
										/>
										<Bar
											dataKey="cycleCount"
											fill="var(--color-blue-500)"
											radius={[0, 4, 4, 0]}
											barSize={16}
										>
											<LabelList
												dataKey="cycleCount"
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
									Shortest cycle:{" "}
									<span className="font-semibold text-card-foreground">
										{stats.shortest}
									</span>
								</span>
								<span>
									Total cycles:{" "}
									<span className="font-semibold text-card-foreground">
										{stats.cycleCount}
									</span>
								</span>
							</div>
							{shortestCycle && (
								<div className="flex flex-col gap-2">
									<span className="text-sm text-muted-foreground">
										Example shortest cycle
									</span>
									<TypePathBreadcrumb
										segments={shortestCycle.segments}
										truncate={false}
									/>
								</div>
							)}
						</>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No relationships data available
				</p>
			)}
			<button
				type="button"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "cyclicReferences" }))
				}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
