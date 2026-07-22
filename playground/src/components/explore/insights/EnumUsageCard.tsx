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
	selectEnumUsage,
	selectEnumUsageStats,
} from "@/store/insights/insightsSelectors";
import {
	openInsightDetail,
	pushInsightDetail,
	selectInsightDetail,
	setInsightsSubTab,
} from "@/store/ui/uiSlice";

const ENUM_AXIS_WIDTH = 140;

export function EnumUsageCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const enumUsage = useAppSelector(selectEnumUsage);
	const stats = useAppSelector(selectEnumUsageStats);
	const selected = detail?.kind === "enumUsage";

	const hasData = !!stats;
	const mostUsed = stats?.mostUsed ?? null;
	const leastUsed = stats?.leastUsed ?? null;
	const unusedCount = stats?.unusedCount ?? 0;
	const topEnums = enumUsage.slice(0, 5);
	const showLeastUsed = stats && stats.usedCount > 1 && leastUsed !== null;

	const openUnusedEnums = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
		dispatch(
			pushInsightDetail({ kind: "unusedList", category: "Unused enums" }),
		);
	};

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Enum Usage
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						{mostUsed ? (
							<p className="text-sm text-card-foreground">
								<span className="font-semibold">{mostUsed.name}</span> is the
								most used enum:{" "}
								<span className="font-semibold">{mostUsed.count}</span> fields
							</p>
						) : (
							<p className="text-sm text-card-foreground">
								No enums are used as field types
							</p>
						)}
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{stats.usedCount}</span> used
							across{" "}
							<span className="font-semibold">{stats.totalOccurrences}</span>{" "}
							field usages
						</p>
					</div>
					{mostUsed && (
						<div className="h-[176px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={topEnums}
									layout="vertical"
									margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
								>
									<XAxis type="number" domain={[0, mostUsed.count]} hide />
									<YAxis
										type="category"
										dataKey="name"
										width={ENUM_AXIS_WIDTH}
										axisLine={false}
										tickLine={false}
										tick={<CategoryTick width={ENUM_AXIS_WIDTH} />}
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
					)}
					<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
						{showLeastUsed && (
							<span>
								Least used:{" "}
								<span className="font-semibold text-card-foreground">
									{leastUsed.name}
								</span>{" "}
								({leastUsed.count})
							</span>
						)}
						<button
							type="button"
							onClick={openUnusedEnums}
							className="cursor-pointer hover:underline"
						>
							Unused:{" "}
							<span className="font-semibold text-card-foreground">
								{unusedCount}
							</span>
						</button>
					</div>
				</>
			) : (
				<p className="text-sm text-muted-foreground">No enum data available</p>
			)}
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "enumUsage" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
