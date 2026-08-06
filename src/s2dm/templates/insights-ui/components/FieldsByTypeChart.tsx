import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectContainerTypeFieldCounts,
	selectContainerTypeFieldStats,
} from "@insights-ui/selectors/concepts";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import { countTiedForTop } from "@insights-ui/utils/countTiedForTop";
import type { ReactNode } from "react";

const TYPE_AXIS_WIDTH = 140;

export function FieldsByTypeChart() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const containerTypeFieldCounts = useInsightsSelector(
		selectContainerTypeFieldCounts,
	);
	const stats = useInsightsSelector(selectContainerTypeFieldStats);
	const selected = selectableCards && detail?.kind === "fieldsByType";

	const largestType = containerTypeFieldCounts[0];
	const hasData = largestType && stats;

	const topContainerTypes = containerTypeFieldCounts.slice(0, 5);
	const tiedForMost = countTiedForTop(
		containerTypeFieldCounts,
		(entry) => entry.fieldCount,
	);
	const nextLargestType = containerTypeFieldCounts[tiedForMost];
	let timesMoreLabel: string | null = null;
	if (nextLargestType && largestType) {
		const timesMore = largestType.fieldCount / nextLargestType.fieldCount;
		timesMoreLabel =
			timesMore % 1 === 0 ? `${timesMore}` : timesMore.toFixed(1);
	}

	let largestTypeSummary: ReactNode = null;
	if (largestType && tiedForMost > 1) {
		largestTypeSummary = (
			<CardSubtitle>
				<span className="font-semibold">{tiedForMost}</span> types are tied for
				most fields, with{" "}
				<span className="font-semibold">{largestType.fieldCount}</span> each
			</CardSubtitle>
		);
	} else if (largestType) {
		largestTypeSummary = (
			<CardSubtitle>
				<span className="font-semibold">{largestType.type}</span> has the most
				fields: <span className="font-semibold">{largestType.fieldCount}</span>
			</CardSubtitle>
		);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Largest Container Types by Fields
			</span>
			{hasData ? (
				<>
					<CardSummary>
						{largestTypeSummary}
						{nextLargestType && (
							<CardSubtitle muted>
								<span className="font-semibold">{timesMoreLabel}×</span> more
								than {nextLargestType.type}, the next largest type
							</CardSubtitle>
						)}
					</CardSummary>
					<HorizontalMetricBarChart
						data={topContainerTypes}
						categoryKey="type"
						valueKey="fieldCount"
						maxValue={largestType.fieldCount}
						axisWidth={TYPE_AXIS_WIDTH}
					/>
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
				</>
			) : (
				<CardSubtitle muted>No field data available</CardSubtitle>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "fieldsByType" }))}
				/>
			)}
		</HighlightableCard>
	);
}
