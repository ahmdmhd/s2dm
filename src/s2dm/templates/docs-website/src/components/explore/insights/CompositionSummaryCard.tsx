import { BreakdownGroups } from "@/components/explore/insights/BreakdownGroups";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	type BreakdownGroup,
	selectEnumUsageStats,
	selectScalarUsageStats,
} from "@/store/insights/insightsSelectors";
import { setInsightsSubTab } from "@/store/ui/uiSlice";

export function CompositionSummaryCard() {
	const dispatch = useAppDispatch();
	const scalarStats = useAppSelector(selectScalarUsageStats);
	const enumStats = useAppSelector(selectEnumUsageStats);

	const groups: BreakdownGroup[] = [];
	if (scalarStats) {
		groups.push({
			title: "Scalars",
			total: scalarStats.scalarCount,
			segments: [
				{
					label: "Built-in",
					value: scalarStats.builtinCount,
					colorClassName: "bg-sky-500",
				},
				{
					label: "Custom",
					value: scalarStats.customCount,
					colorClassName: "bg-purple-500",
				},
			],
		});
	}
	if (enumStats) {
		groups.push({
			title: "Enums",
			total: enumStats.usedCount + enumStats.unusedCount,
			segments: [
				{
					label: "Used",
					value: enumStats.usedCount,
					colorClassName: "bg-sky-500",
				},
				{
					label: "Unused",
					value: enumStats.unusedCount,
					colorClassName: "bg-purple-500",
				},
			],
		});
	}

	return (
		<HighlightableCard>
			<span className="text-lg font-semibold text-card-foreground">
				Composition Summary
			</span>
			{groups.length > 0 ? (
				<BreakdownGroups groups={groups} />
			) : (
				<p className="text-sm text-muted-foreground">
					No composition data available
				</p>
			)}
			<InsightLinkButton
				label="View composition"
				onClick={() => dispatch(setInsightsSubTab("composition"))}
			/>
		</HighlightableCard>
	);
}
