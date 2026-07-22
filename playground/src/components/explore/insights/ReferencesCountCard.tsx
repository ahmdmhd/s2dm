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
	selectReferenceCountStats,
	selectReferenceCounts,
} from "@/store/insights/insightsSelectors";
import {
	openInsightDetail,
	selectInsightDetail,
	setInsightsSubTab,
} from "@/store/ui/uiSlice";

const REFERENCE_AXIS_WIDTH = 140;

export function ReferencesCountCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const referenceCounts = useAppSelector(selectReferenceCounts);
	const stats = useAppSelector(selectReferenceCountStats);
	const selected = detail?.kind === "references";

	const hasData = !!stats;
	const mostReferenced = stats?.mostReferenced ?? null;
	const leastReferenced = stats?.leastReferenced ?? null;
	const unusedCount = stats?.unusedCount ?? 0;
	const topReferences = referenceCounts.slice(0, 5);
	const showLeastReferenced =
		stats && stats.referencedCount > 1 && leastReferenced !== null;

	const openUnusedElements = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
	};

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				References Count
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						{mostReferenced ? (
							<p className="text-sm text-card-foreground">
								{mostReferenced.kind}{" "}
								<span className="font-semibold">{mostReferenced.name}</span> is
								the most referenced with{" "}
								<span className="font-semibold">
									{mostReferenced.count.toLocaleString()}
								</span>{" "}
								references
							</p>
						) : (
							<p className="text-sm text-card-foreground">
								No referenced types or directives
							</p>
						)}
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">
								{stats.typeCount.toLocaleString()}
							</span>{" "}
							types,{" "}
							<span className="font-semibold">
								{stats.directiveCount.toLocaleString()}
							</span>{" "}
							directives referenced
						</p>
					</div>
					{mostReferenced && (
						<div className="h-[176px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={topReferences}
									layout="vertical"
									margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
								>
									<XAxis
										type="number"
										domain={[0, mostReferenced.count]}
										hide
									/>
									<YAxis
										type="category"
										dataKey="name"
										width={REFERENCE_AXIS_WIDTH}
										axisLine={false}
										tickLine={false}
										tick={<CategoryTick width={REFERENCE_AXIS_WIDTH} />}
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
						{showLeastReferenced && (
							<span>
								Least referenced:{" "}
								<span className="font-semibold text-card-foreground">
									{leastReferenced.name}
								</span>{" "}
								({leastReferenced.count.toLocaleString()})
							</span>
						)}
						<button
							type="button"
							onClick={openUnusedElements}
							className="cursor-pointer hover:underline"
						>
							Unused:{" "}
							<span className="font-semibold text-card-foreground">
								{unusedCount.toLocaleString()}
							</span>
						</button>
					</div>
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No references data available
				</p>
			)}
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "references" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
