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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectScalarUsage,
	selectScalarUsageStats,
} from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const SCALAR_AXIS_WIDTH = 140;

export function ScalarDistributionChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const scalarUsage = useAppSelector(selectScalarUsage);
	const stats = useAppSelector(selectScalarUsageStats);
	const selected = detail?.kind === "scalarDistribution";

	const hasData = !!stats;
	const topScalars = scalarUsage.slice(0, 5);
	const topScalar = stats?.topScalar;

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Scalar Distribution
			</span>
			{hasData && topScalar ? (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							<span className="font-semibold">{topScalar.name}</span> is the
							most used datatype:{" "}
							<span className="font-semibold">{topScalar.count}</span> fields
						</p>
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{stats.scalarCount}</span>{" "}
							datatypes across{" "}
							<span className="font-semibold">{stats.totalOccurrences}</span>{" "}
							field usages
						</p>
					</div>
					<div className="h-[176px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={topScalars}
								layout="vertical"
								margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
							>
								<XAxis type="number" domain={[0, topScalar.count]} hide />
								<YAxis
									type="category"
									dataKey="name"
									width={SCALAR_AXIS_WIDTH}
									axisLine={false}
									tickLine={false}
									tick={<CategoryTick width={SCALAR_AXIS_WIDTH} />}
								/>
								<Bar
									dataKey="count"
									fill="var(--color-blue-500)"
									radius={[0, 4, 4, 0]}
									barSize={16}
								>
									<LabelList
										dataKey="count"
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
							Built-in:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.builtinCount}
							</span>
						</span>
						<span>
							Custom scalars:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.customCount}
							</span>
						</span>
					</div>
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No scalar data available
				</p>
			)}
			<button
				type="button"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "scalarDistribution" }))
				}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
