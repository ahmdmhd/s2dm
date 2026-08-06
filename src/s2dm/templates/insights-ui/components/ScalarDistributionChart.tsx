import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { ScalarTypeBadge } from "@insights-ui/components/ScalarTypeBadge";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectScalarUsage,
	selectScalarUsageStats,
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
import pluralize from "pluralize";
import type { ReactNode } from "react";

const SCALAR_AXIS_WIDTH = 200;

export function ScalarDistributionChart() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const scalarUsage = useInsightsSelector(selectScalarUsage);
	const stats = useInsightsSelector(selectScalarUsageStats);
	const selected = selectableCards && detail?.kind === "scalarDistribution";

	const hasData = !!stats;
	const topScalars = scalarUsage.slice(0, 5);
	const topScalar = stats?.topScalar;
	const tiedForMost = countTiedForTop(scalarUsage, (entry) => entry.count);
	const builtinByName = new Map<string, boolean>(
		topScalars.map((scalar) => [scalar.name, scalar.is_builtin]),
	);

	function renderScalarTypeBadge(value: string | number) {
		const isBuiltin = builtinByName.get(String(value));
		if (isBuiltin === undefined) {
			return null;
		}
		return <ScalarTypeBadge isBuiltin={isBuiltin} />;
	}

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
						renderCategoryBadge={renderScalarTypeBadge}
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
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() =>
						dispatch(openInsightDetail({ kind: "scalarDistribution" }))
					}
				/>
			)}
		</HighlightableCard>
	);
}
