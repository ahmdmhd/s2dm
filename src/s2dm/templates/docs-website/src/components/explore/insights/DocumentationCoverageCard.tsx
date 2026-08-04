import pluralize from "pluralize";
import { DocumentationCoverageBar } from "@/components/explore/insights/DocumentationCoverageBar";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppSelector } from "@/store/hooks";
import {
	selectCoverageCategories,
	selectDocumentationCoverageStats,
} from "@/store/insights/insightsSelectors";

export function DocumentationCoverageCard() {
	const coverageCategories = useAppSelector(selectCoverageCategories);
	const stats = useAppSelector(selectDocumentationCoverageStats);

	const hasData = !!stats;
	const overallCoverage = stats?.overallCoverage ?? 0;
	const documentedElements = stats?.documented ?? 0;
	const totalElements = stats?.total ?? 0;

	return (
		<HighlightableCard>
			<span className="text-lg font-semibold text-card-foreground">
				Documentation Coverage
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-sm text-card-foreground">
							<span className="font-semibold">{overallCoverage}%</span> overall
							coverage
						</p>
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{documentedElements}</span> of{" "}
							{totalElements} {pluralize("element", totalElements)} documented
						</p>
					</div>
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
				<p className="text-sm text-muted-foreground">
					No documentation data available
				</p>
			)}
		</HighlightableCard>
	);
}
