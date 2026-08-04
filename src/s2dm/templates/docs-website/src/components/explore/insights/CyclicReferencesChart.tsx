import pluralize from "pluralize";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { HorizontalMetricBarChart } from "@/components/explore/insights/HorizontalMetricBarChart";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { useAppSelector } from "@/store/hooks";
import {
	selectCycleLengthDistribution,
	selectCyclicReferenceStats,
	selectShortestCycle,
} from "@/store/insights/insightsSelectors";
import { selectInsightsRelationships } from "@/store/insights/insightsSlice";
import { formatPathSegments } from "@/utils/formatPathSegments";

const LENGTH_AXIS_WIDTH = 64;

export function CyclicReferencesChart() {
	const relationships = useAppSelector(selectInsightsRelationships);
	const lengthDistribution = useAppSelector(selectCycleLengthDistribution);
	const stats = useAppSelector(selectCyclicReferenceStats);
	const shortestCycle = useAppSelector(selectShortestCycle);

	const hasData = !!relationships;
	const cycleCount = stats?.cycleCount ?? 0;
	const maxCycleCount = stats
		? Math.max(1, ...lengthDistribution.map((row) => row.cycleCount))
		: 0;

	return (
		<HighlightableCard>
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
		</HighlightableCard>
	);
}
