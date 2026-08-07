import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
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
		mostReferencedSummary = <CardSubtitle>No referenced types</CardSubtitle>;
	} else if (tiedForMost > 1) {
		mostReferencedSummary = (
			<CardSubtitle>
				<span className="font-semibold">{tiedForMost}</span> types are tied for
				most referenced, with{" "}
				<span className="font-semibold">
					{mostReferenced.count.toLocaleString()}
				</span>{" "}
				{pluralize("reference", mostReferenced.count)} each
			</CardSubtitle>
		);
	} else {
		mostReferencedSummary = (
			<CardSubtitle>
				<span className="font-semibold">{mostReferenced.name}</span> is the most
				referenced with{" "}
				<span className="font-semibold">
					{mostReferenced.count.toLocaleString()}
				</span>{" "}
				{pluralize("reference", mostReferenced.count)}
			</CardSubtitle>
		);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				References Count
			</span>
			{hasData ? (
				<>
					<CardSummary>
						{mostReferencedSummary}
						<CardSubtitle muted>
							<span className="font-semibold">
								{stats.referencedCount.toLocaleString()}
							</span>{" "}
							{pluralize("type", stats.referencedCount)} referenced
						</CardSubtitle>
					</CardSummary>
					{mostReferenced && (
						<HorizontalMetricBarChart
							data={topReferences}
							categoryKey="name"
							valueKey="count"
							maxValue={mostReferenced.count}
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
						<InsightLinkButton
							label={`Unused: ${unusedCount.toLocaleString()}`}
							onClick={openUnusedElements}
						/>
					</div>
				</>
			) : (
				<CardSubtitle muted>No references data available</CardSubtitle>
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
