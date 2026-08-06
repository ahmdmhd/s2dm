import { BreakdownGroups } from "@insights-ui/components/BreakdownGroups";
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
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							The composed model has{" "}
							<span className="font-semibold">{totalElements}</span>{" "}
							{pluralize("element", totalElements)}
						</p>
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{largestGroup.title}</span> are
							the most common, with{" "}
							<span className="font-semibold">{largestGroup.total}</span>
						</p>
					</div>
					<BreakdownGroups groups={elementGroups} />
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No elements found in the model
				</p>
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
