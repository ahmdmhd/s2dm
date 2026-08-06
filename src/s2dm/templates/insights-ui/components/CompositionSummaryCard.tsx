import { BreakdownGroups } from "@insights-ui/components/BreakdownGroups";
import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
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
import pluralize from "pluralize";

export function CompositionSummaryCard() {
	const dispatch = useInsightsDispatch();
	const scalarStats = useInsightsSelector(selectScalarUsageStats);
	const enumStats = useInsightsSelector(selectEnumUsageStats);

	const scalarCount = scalarStats?.scalarCount ?? 0;
	const customScalarCount = scalarStats?.customCount ?? 0;
	const enumCount = enumStats ? enumStats.usedCount + enumStats.unusedCount : 0;
	const unusedEnumCount = enumStats?.unusedCount ?? 0;

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
			total: enumCount,
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
				<>
					<CardSummary>
						<CardSubtitle>
							The composed model uses{" "}
							<span className="font-semibold">{scalarCount}</span>{" "}
							{pluralize("scalar type", scalarCount)} and{" "}
							<span className="font-semibold">{enumCount}</span>{" "}
							{pluralize("enum", enumCount)}
						</CardSubtitle>
						<CardSubtitle muted>
							<span className="font-semibold">{customScalarCount}</span> custom{" "}
							{pluralize("scalar", customScalarCount)} and{" "}
							<span className="font-semibold">{unusedEnumCount}</span> unused{" "}
							{pluralize("enum", unusedEnumCount)}
						</CardSubtitle>
					</CardSummary>
					<BreakdownGroups groups={groups} />
				</>
			) : (
				<CardSubtitle muted>No composition data available</CardSubtitle>
			)}
			<InsightLinkButton
				label="View composition"
				onClick={() => dispatch(setInsightsSubTab("composition"))}
			/>
		</HighlightableCard>
	);
}
