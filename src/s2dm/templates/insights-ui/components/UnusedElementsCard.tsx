import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import { selectUnusedCategories } from "@insights-ui/selectors/quality";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import pluralize from "pluralize";

const ROW_HEIGHT = 44;

export function UnusedElementsCard() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const unusedCategories = useInsightsSelector(selectUnusedCategories);
	const selected = selectableCards && detail?.kind === "unused";

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
					<CardSummary>
						<CardSubtitle>
							<span className="font-semibold">{totalUnused}</span> unused{" "}
							{pluralize("element", totalUnused)}
						</CardSubtitle>
						{totalUnused > 0 ? (
							<CardSubtitle muted>
								out of <span className="font-semibold">{totalElements}</span>{" "}
								{pluralize("element", totalElements)}
							</CardSubtitle>
						) : (
							<CardSubtitle muted>
								No unused elements were found in the model
							</CardSubtitle>
						)}
					</CardSummary>
					{totalUnused > 0 && (
						<HorizontalMetricBarChart
							data={chartCategories}
							categoryKey="label"
							valueKey="unused"
							maxValue={maxUnused}
							height={chartHeight}
						/>
					)}
				</>
			) : (
				<CardSubtitle muted>No unused elements data available</CardSubtitle>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "unused" }))}
				/>
			)}
		</HighlightableCard>
	);
}
