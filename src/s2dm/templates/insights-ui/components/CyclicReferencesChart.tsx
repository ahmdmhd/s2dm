import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectCycleLengthDistribution,
	selectCyclicReferenceStats,
	selectShortestCycle,
} from "@insights-ui/selectors/relationships";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import { selectInsightsRelationships } from "@insights-ui/state/insightsSlice";
import { formatPathSegments } from "@insights-ui/utils/formatPathSegments";
import pluralize from "pluralize";

const LENGTH_AXIS_WIDTH = 64;

export function CyclicReferencesChart() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const relationships = useInsightsSelector(selectInsightsRelationships);
	const lengthDistribution = useInsightsSelector(selectCycleLengthDistribution);
	const stats = useInsightsSelector(selectCyclicReferenceStats);
	const shortestCycle = useInsightsSelector(selectShortestCycle);
	const selected = selectableCards && detail?.kind === "cyclicReferences";

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
							<span className="font-semibold">{cycleCount}</span> cyclic{" "}
							{pluralize("reference", cycleCount)}{" "}
							{cycleCount === 1 ? "was" : "were"} detected
						</p>
						{stats ? (
							<p className="text-sm text-muted-foreground">
								The shortest cycle is{" "}
								<span className="font-semibold">{stats.shortest}</span>{" "}
								{pluralize("hop", stats.shortest)} long
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No reference loops were found in the model
							</p>
						)}
					</div>
					{stats && (
						<>
							<HorizontalMetricBarChart
								data={lengthDistribution}
								categoryKey="length"
								valueKey="cycleCount"
								maxValue={maxCycleCount}
								axisWidth={LENGTH_AXIS_WIDTH}
								formatCategory={(length) => `Length ${length}`}
							/>
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
										segments={formatPathSegments(shortestCycle.segments)}
										maxSegments={4}
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
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() =>
						dispatch(openInsightDetail({ kind: "cyclicReferences" }))
					}
				/>
			)}
		</HighlightableCard>
	);
}
