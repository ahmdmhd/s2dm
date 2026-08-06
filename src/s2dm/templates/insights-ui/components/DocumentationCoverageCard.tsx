import { CardSubtitle, CardSummary } from "@insights-ui/components/CardSummary";
import { DocumentationCoverageBar } from "@insights-ui/components/DocumentationCoverageBar";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectCoverageCategories,
	selectDocumentationCoverageStats,
} from "@insights-ui/selectors/coverage";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import pluralize from "pluralize";

export function DocumentationCoverageCard() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const coverageCategories = useInsightsSelector(selectCoverageCategories);
	const stats = useInsightsSelector(selectDocumentationCoverageStats);
	const selected = selectableCards && detail?.kind === "undocumented";

	const hasData = !!stats;
	const overallCoverage = stats?.overallCoverage ?? 0;
	const documentedElements = stats?.documented ?? 0;
	const totalElements = stats?.total ?? 0;

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Documentation Coverage
			</span>
			{hasData ? (
				<>
					<CardSummary>
						<CardSubtitle>
							<span className="font-semibold">{overallCoverage}%</span> overall
							coverage
						</CardSubtitle>
						<CardSubtitle muted>
							<span className="font-semibold">{documentedElements}</span> of{" "}
							{totalElements} {pluralize("element", totalElements)} documented
						</CardSubtitle>
					</CardSummary>
					<div className="flex flex-col gap-3">
						{coverageCategories.map((category) => (
							<DocumentationCoverageBar
								key={category.label}
								label={category.label}
								documented={category.documented}
								total={category.total}
							/>
						))}
					</div>
				</>
			) : (
				<CardSubtitle muted>No documentation data available</CardSubtitle>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "undocumented" }))}
				/>
			)}
		</HighlightableCard>
	);
}
