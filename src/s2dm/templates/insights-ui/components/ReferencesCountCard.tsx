import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { HorizontalMetricBarChart } from "@insights-ui/components/HorizontalMetricBarChart";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectReferenceCountStats,
	selectReferenceCounts,
} from "@insights-ui/selectors/relationships";
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

const REFERENCE_AXIS_WIDTH = 140;

export function ReferencesCountCard() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const referenceCounts = useInsightsSelector(selectReferenceCounts);
	const stats = useInsightsSelector(selectReferenceCountStats);
	const selected = selectableCards && detail?.kind === "references";

	const hasData = !!stats;
	const mostReferenced = stats?.mostReferenced ?? null;
	const leastReferenced = stats?.leastReferenced ?? null;
	const unusedCount = stats?.unusedCount ?? 0;
	const topReferences = referenceCounts.slice(0, 5);
	const showLeastReferenced =
		stats && stats.referencedCount > 1 && leastReferenced !== null;
	const tiedForMost = countTiedForTop(referenceCounts, (entry) => entry.count);

	const openUnusedElements = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
	};

	let mostReferencedSummary: ReactNode;
	if (!mostReferenced) {
		mostReferencedSummary = (
			<p className="text-sm text-card-foreground">No referenced types</p>
		);
	} else if (tiedForMost > 1) {
		mostReferencedSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{tiedForMost}</span> types are tied for
				most referenced, with{" "}
				<span className="font-semibold">
					{mostReferenced.count.toLocaleString()}
				</span>{" "}
				{pluralize("reference", mostReferenced.count)} each
			</p>
		);
	} else {
		mostReferencedSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{mostReferenced.name}</span> is the most
				referenced with{" "}
				<span className="font-semibold">
					{mostReferenced.count.toLocaleString()}
				</span>{" "}
				{pluralize("reference", mostReferenced.count)}
			</p>
		);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				References Count
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						{mostReferencedSummary}
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">
								{stats.referencedCount.toLocaleString()}
							</span>{" "}
							{pluralize("type", stats.referencedCount)} referenced
						</p>
					</div>
					{mostReferenced && (
						<HorizontalMetricBarChart
							data={topReferences}
							categoryKey="name"
							valueKey="count"
							maxValue={mostReferenced.count}
							axisWidth={REFERENCE_AXIS_WIDTH}
						/>
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
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "references" }))}
				/>
			)}
		</HighlightableCard>
	);
}
