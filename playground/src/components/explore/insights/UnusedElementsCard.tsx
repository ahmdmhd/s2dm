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
import { selectUnusedCategories } from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const CATEGORY_AXIS_WIDTH = 80;
const ROW_HEIGHT = 44;

export function UnusedElementsCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const unusedCategories = useAppSelector(selectUnusedCategories);
	const selected = detail?.kind === "unused";

	const hasData = unusedCategories.length > 0;
	const totalUnused = unusedCategories.reduce(
		(sum, category) => sum + category.unused,
		0,
	);
	const totalElements = unusedCategories.reduce(
		(sum, category) => sum + category.total,
		0,
	);
	const chartCategories = unusedCategories.filter(
		(category) => category.unused > 0,
	);
	const maxUnused = Math.max(
		1,
		...chartCategories.map((category) => category.unused),
	);
	const chartHeight = chartCategories.length * ROW_HEIGHT;

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Unused Elements
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							<span className="font-semibold">{totalUnused}</span> unused
							elements
						</p>
						{totalUnused > 0 ? (
							<p className="text-sm text-muted-foreground">
								out of <span className="font-semibold">{totalElements}</span>{" "}
								elements
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No unused elements were found in the model
							</p>
						)}
					</div>
					{totalUnused > 0 && (
						<div className="w-full" style={{ height: chartHeight }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={chartCategories}
									layout="vertical"
									margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
								>
									<XAxis type="number" domain={[0, maxUnused]} hide />
									<YAxis
										type="category"
										dataKey="label"
										width={CATEGORY_AXIS_WIDTH}
										axisLine={false}
										tickLine={false}
										tick={<CategoryTick width={CATEGORY_AXIS_WIDTH} />}
									/>
									<Bar
										dataKey="unused"
										fill="var(--color-blue-500)"
										radius={[0, 4, 4, 0]}
										barSize={16}
									>
										<LabelList
											dataKey="unused"
											position="right"
											fill="var(--color-card-foreground)"
											fontSize={12}
										/>
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No unused elements data available
				</p>
			)}
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "unused" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
