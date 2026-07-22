import { ArrowRight } from "lucide-react";
import { BreakdownGroups } from "@/components/explore/insights/BreakdownGroups";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
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
				Elements breakdown
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							The composed model has{" "}
							<span className="font-semibold">{totalElements}</span> elements
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
			<button
				type="button"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "conceptsBreakdown" }))
				}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
