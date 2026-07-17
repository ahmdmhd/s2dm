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
	selectContainerTypeFieldCounts,
	selectContainerTypeFieldStats,
} from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const TYPE_AXIS_WIDTH = 140;

export function FieldsByTypeChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const containerTypeFieldCounts = useAppSelector(
		selectContainerTypeFieldCounts,
	);
	const stats = useAppSelector(selectContainerTypeFieldStats);
	const selected = detail?.kind === "fieldsByType";

	const largestType = containerTypeFieldCounts[0];
	if (!largestType || !stats) {
		return null;
	}

	const topContainerTypes = containerTypeFieldCounts.slice(0, 5);
	const secondLargestType = containerTypeFieldCounts[1];
	let timesMoreLabel: string | null = null;
	if (secondLargestType) {
		const timesMore = largestType.fieldCount / secondLargestType.fieldCount;
		timesMoreLabel =
			timesMore % 1 === 0 ? `${timesMore}` : timesMore.toFixed(1);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Largest Container Types by Fields
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-sm text-card-foreground">
					<span className="font-semibold">{largestType.type}</span> has the most
					fields:{" "}
					<span className="font-semibold">{largestType.fieldCount}</span>
				</p>
				{secondLargestType && (
					<p className="text-sm text-muted-foreground">
						<span className="font-semibold">{timesMoreLabel}×</span> more than{" "}
						{secondLargestType.type}, the second largest type
					</p>
				)}
			</div>
			<div className="h-[176px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={topContainerTypes}
						layout="vertical"
						margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
					>
						<XAxis type="number" domain={[0, largestType.fieldCount]} hide />
						<YAxis
							type="category"
							dataKey="type"
							width={TYPE_AXIS_WIDTH}
							axisLine={false}
							tickLine={false}
							tick={<CategoryTick width={TYPE_AXIS_WIDTH} />}
						/>
						<Bar
							dataKey="fieldCount"
							fill="var(--color-blue-500)"
							radius={[0, 4, 4, 0]}
							barSize={16}
						>
							<LabelList
								dataKey="fieldCount"
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
					Average fields per type:{" "}
					<span className="font-semibold text-card-foreground">
						{stats.average.toFixed(1)}
					</span>
				</span>
				<span>
					Median fields per type:{" "}
					<span className="font-semibold text-card-foreground">
						{stats.median}
					</span>
				</span>
			</div>
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "fieldsByType" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
