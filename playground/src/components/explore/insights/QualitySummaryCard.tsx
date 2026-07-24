import { BreakdownGroups } from "@/components/explore/insights/BreakdownGroups";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	type BreakdownGroup,
	selectDocumentationCoverageStats,
	selectMissingUnitsStats,
	selectUnusedCategories,
} from "@/store/insights/insightsSelectors";
import { setInsightsSubTab } from "@/store/ui/uiSlice";

const UNUSED_COLORS = ["bg-sky-500", "bg-purple-500", "bg-emerald-500"];

export function QualitySummaryCard() {
	const dispatch = useAppDispatch();
	const documentationStats = useAppSelector(selectDocumentationCoverageStats);
	const unusedCategories = useAppSelector(selectUnusedCategories);
	const missingUnitsStats = useAppSelector(selectMissingUnitsStats);

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
				Quality summary
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
