import { BreakdownGroups } from "@insights-ui/components/BreakdownGroups";
import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import { selectElementGroups } from "@insights-ui/selectors/concepts";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import pluralize from "pluralize";

export function ConceptsBreakdown() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const elementGroups = useInsightsSelector(selectElementGroups);
	const selected = selectableCards && detail?.kind === "conceptsBreakdown";

	const hasData = elementGroups.length > 0;
	const totalElements = elementGroups.reduce(
		(sum, group) => sum + group.total,
		0,
	);
	let largestGroup = elementGroups[0];
	for (const group of elementGroups) {
		if (group.total > largestGroup.total) {
			largestGroup = group;
		}
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Elements Breakdown
			</span>
			{hasData ? (
				<>
					<CardSummary>
						<CardSubtitle>
							The composed model has{" "}
							<span className="font-semibold">{totalElements}</span>{" "}
							{pluralize("element", totalElements)}
						</CardSubtitle>
						<CardSubtitle muted>
							<span className="font-semibold">
								{pluralize.singular(largestGroup.title)}
							</span>{" "}
							is the most used element kind (
							<span className="font-semibold">{largestGroup.total}</span>)
						</CardSubtitle>
					</CardSummary>
					<BreakdownGroups groups={elementGroups} />
				</>
			) : (
				<CardSubtitle muted>No elements found in the model</CardSubtitle>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() =>
						dispatch(openInsightDetail({ kind: "conceptsBreakdown" }))
					}
				/>
			)}
		</HighlightableCard>
	);
}
