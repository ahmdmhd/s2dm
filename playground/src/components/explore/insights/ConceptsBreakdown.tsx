import pluralize from "pluralize";
import { BreakdownGroups } from "@/components/explore/insights/BreakdownGroups";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectElementGroups } from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

export function ConceptsBreakdown() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const elementGroups = useAppSelector(selectElementGroups);
	const selected = detail?.kind === "conceptsBreakdown";

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
			<InsightLinkButton
				label="View details"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "conceptsBreakdown" }))
				}
			/>
		</HighlightableCard>
	);
}
