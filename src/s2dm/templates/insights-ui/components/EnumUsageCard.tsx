import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectEnumUsage,
	selectEnumUsageStats,
} from "@insights-ui/selectors/concepts";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
	setInsightsSubTab,
} from "@insights-ui/state/insightDetailSlice";
import { countTiedForTop } from "@insights-ui/utils/countTiedForTop";
import pluralize from "pluralize";
import type { ReactNode } from "react";

const ENUM_AXIS_WIDTH = 140;

export function EnumUsageCard() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const enumUsage = useInsightsSelector(selectEnumUsage);
	const stats = useInsightsSelector(selectEnumUsageStats);
	const selected = selectableCards && detail?.kind === "enumUsage";

	const hasData = !!stats;
	const mostUsed = stats?.mostUsed ?? null;
	const leastUsed = stats?.leastUsed ?? null;
	const unusedCount = stats?.unusedCount ?? 0;
	const topEnums = enumUsage.slice(0, 5);
	const showLeastUsed = stats && stats.usedCount > 1 && leastUsed !== null;
	const tiedForMost = countTiedForTop(enumUsage, (entry) => entry.count);

	const openUnusedEnums = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
	};

	let mostUsedSummary: ReactNode;
	if (!mostUsed) {
		mostUsedSummary = <CardSubtitle>No enums are used</CardSubtitle>;
	} else if (tiedForMost > 1) {
		mostUsedSummary = (
			<CardSubtitle>
				<span className="font-semibold">{tiedForMost}</span> enums are tied for
				most used, with <span className="font-semibold">{mostUsed.count}</span>{" "}
				{pluralize("usage", mostUsed.count)} each
			</CardSubtitle>
		);
	} else {
		mostUsedSummary = (
			<CardSubtitle>
				<span className="font-semibold">{mostUsed.name}</span> is the most used
				enum: <span className="font-semibold">{mostUsed.count}</span>{" "}
				{pluralize("usage", mostUsed.count)}
			</CardSubtitle>
		);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Enum Usage
			</span>
			{hasData ? (
				<>
					<CardSummary>
						{mostUsedSummary}
						<CardSubtitle muted>
							<span className="font-semibold">{stats.usedCount}</span> used
							across{" "}
							<span className="font-semibold">{stats.totalOccurrences}</span>{" "}
							{pluralize("usage", stats.totalOccurrences)}
						</CardSubtitle>
					</CardSummary>
					{mostUsed && (
						<HorizontalMetricBarChart
							data={topEnums}
							categoryKey="name"
							valueKey="count"
							maxValue={mostUsed.count}
							axisWidth={ENUM_AXIS_WIDTH}
						/>
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
						<InsightLinkButton
							label={`Unused: ${unusedCount}`}
							onClick={openUnusedEnums}
						/>
					</div>
				</>
			) : (
				<CardSubtitle muted>No enum data available</CardSubtitle>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "enumUsage" }))}
				/>
			)}
		</HighlightableCard>
	);
}
