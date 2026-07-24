import pluralize from "pluralize";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { HorizontalMetricBarChart } from "@/components/explore/insights/HorizontalMetricBarChart";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
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
							<span className="font-semibold">{totalUnused}</span> unused{" "}
							{pluralize("element", totalUnused)}
						</p>
						{totalUnused > 0 ? (
							<p className="text-sm text-muted-foreground">
								out of <span className="font-semibold">{totalElements}</span>{" "}
								{pluralize("element", totalElements)}
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No unused elements were found in the model
							</p>
						)}
					</div>
					{totalUnused > 0 && (
						<HorizontalMetricBarChart
							data={chartCategories}
							categoryKey="label"
							valueKey="unused"
							maxValue={maxUnused}
							axisWidth={CATEGORY_AXIS_WIDTH}
							height={chartHeight}
						/>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No unused elements data available
				</p>
			)}
			<InsightLinkButton
				label="View details"
				onClick={() => dispatch(openInsightDetail({ kind: "unused" }))}
			/>
		</HighlightableCard>
	);
}
