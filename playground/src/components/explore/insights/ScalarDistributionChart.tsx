import pluralize from "pluralize";
import type { ReactNode } from "react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { HorizontalMetricBarChart } from "@/components/explore/insights/HorizontalMetricBarChart";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectScalarUsage,
	selectScalarUsageStats,
} from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";
import { countTiedForTop } from "@/utils/countTiedForTop";

const SCALAR_AXIS_WIDTH = 140;

export function ScalarDistributionChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const scalarUsage = useAppSelector(selectScalarUsage);
	const stats = useAppSelector(selectScalarUsageStats);
	const selected = detail?.kind === "scalarDistribution";

	const hasData = !!stats;
	const topScalars = scalarUsage.slice(0, 5);
	const topScalar = stats?.topScalar;
	const tiedForMost = countTiedForTop(scalarUsage, (entry) => entry.count);

	let topScalarSummary: ReactNode = null;
	if (topScalar && tiedForMost > 1) {
		topScalarSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{tiedForMost}</span> datatypes are tied
				for most used, with{" "}
				<span className="font-semibold">{topScalar.count}</span>{" "}
				{pluralize("field", topScalar.count)} each
			</p>
		);
	} else if (topScalar) {
		topScalarSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{topScalar.name}</span> is the most used
				datatype: <span className="font-semibold">{topScalar.count}</span>{" "}
				{pluralize("field", topScalar.count)}
			</p>
		);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Scalar Distribution
			</span>
			{hasData && topScalar ? (
				<>
					<div className="flex flex-col gap-1">
						{topScalarSummary}
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{stats.scalarCount}</span>{" "}
							{pluralize("datatype", stats.scalarCount)} across{" "}
							<span className="font-semibold">{stats.totalOccurrences}</span>{" "}
							field {pluralize("usage", stats.totalOccurrences)}
						</p>
					</div>
					<HorizontalMetricBarChart
						data={topScalars}
						categoryKey="name"
						valueKey="count"
						maxValue={topScalar.count}
						axisWidth={SCALAR_AXIS_WIDTH}
					/>
					<div className="flex gap-6 text-sm text-muted-foreground">
						<span>
							Built-in:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.builtinCount}
							</span>
						</span>
						<span>
							Custom scalars:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.customCount}
							</span>
						</span>
					</div>
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No scalar data available
				</p>
			)}
			<InsightLinkButton
				label="View details"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "scalarDistribution" }))
				}
			/>
		</HighlightableCard>
	);
}
