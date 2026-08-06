import { BreakdownGroups } from "@insights-ui/components/BreakdownGroups";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import {
	type BreakdownGroup,
	selectEnumUsageStats,
	selectScalarUsageStats,
} from "@insights-ui/selectors/concepts";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import { setInsightsSubTab } from "@insights-ui/state/insightDetailSlice";

export function CompositionSummaryCard() {
	const dispatch = useInsightsDispatch();
	const scalarStats = useInsightsSelector(selectScalarUsageStats);
	const enumStats = useInsightsSelector(selectEnumUsageStats);

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
