import pluralize from "pluralize";
import { BreakdownGroups } from "@/components/explore/insights/BreakdownGroups";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppSelector } from "@/store/hooks";
import { selectElementGroups } from "@/store/insights/insightsSelectors";

export function ConceptsBreakdown() {
	const elementGroups = useAppSelector(selectElementGroups);

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
		<HighlightableCard>
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
		</HighlightableCard>
	);
}
