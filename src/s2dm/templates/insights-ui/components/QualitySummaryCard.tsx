import { BreakdownGroups } from "@insights-ui/components/BreakdownGroups";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import type { BreakdownGroup } from "@insights-ui/selectors/concepts";
import { selectDocumentationCoverageStats } from "@insights-ui/selectors/coverage";
import {
	selectMissingUnitsStats,
	selectUnusedCategories,
} from "@insights-ui/selectors/quality";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import { setInsightsSubTab } from "@insights-ui/state/insightDetailSlice";

const UNUSED_COLORS = ["bg-sky-500", "bg-purple-500", "bg-emerald-500"];

export function QualitySummaryCard() {
	const dispatch = useInsightsDispatch();
	const documentationStats = useInsightsSelector(
		selectDocumentationCoverageStats,
	);
	const unusedCategories = useInsightsSelector(selectUnusedCategories);
	const missingUnitsStats = useInsightsSelector(selectMissingUnitsStats);

	const groups: BreakdownGroup[] = [];
	if (documentationStats) {
		groups.push({
			title: "Documentation",
			total: documentationStats.total,
			segments: [
				{
					label: "Documented",
					value: documentationStats.documented,
					colorClassName: "bg-sky-500",
				},
				{
					label: "Undocumented",
					value: documentationStats.total - documentationStats.documented,
					colorClassName: "bg-purple-500",
				},
			],
		});
	}
	if (unusedCategories.length > 0) {
		const totalUnused = unusedCategories.reduce(
			(sum, category) => sum + category.unused,
			0,
		);
		groups.push({
			title: "Unused elements",
			total: totalUnused,
			segments: unusedCategories.map((category, index) => ({
				label: category.label,
				value: category.unused,
				colorClassName: UNUSED_COLORS[index % UNUSED_COLORS.length],
			})),
		});
	}
	if (missingUnitsStats) {
		groups.push({
			title: "Missing units",
			total: missingUnitsStats.count,
		});
	}

	return (
		<HighlightableCard>
			<span className="text-lg font-semibold text-card-foreground">
				Quality Summary
			</span>
			{groups.length > 0 ? (
				<BreakdownGroups groups={groups} />
			) : (
				<p className="text-sm text-muted-foreground">
					No quality data available
				</p>
			)}
			<InsightLinkButton
				label="View quality"
				onClick={() => dispatch(setInsightsSubTab("quality"))}
			/>
		</HighlightableCard>
	);
}
