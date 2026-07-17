import { ArrowRight } from "lucide-react";
import { DocumentationCoverageBar } from "@/components/explore/insights/DocumentationCoverageBar";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCoverageCategories } from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

export function DocumentationCoverageCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const coverageCategories = useAppSelector(selectCoverageCategories);
	const selected = detail?.kind === "undocumented";

	if (coverageCategories.length === 0) {
		return null;
	}

	const totalElements = coverageCategories.reduce(
		(sum, category) => sum + category.total,
		0,
	);
	const documentedElements = coverageCategories.reduce(
		(sum, category) => sum + category.documented,
		0,
	);
	const overallCoverage =
		totalElements === 0
			? 0
			: Math.round((documentedElements / totalElements) * 100);

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Documentation Coverage
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-sm text-card-foreground">
					<span className="font-semibold">{overallCoverage}%</span> overall
					coverage
				</p>
				<p className="text-sm text-muted-foreground">
					<span className="font-semibold">{documentedElements}</span> of{" "}
					{totalElements} elements documented
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
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "undocumented" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
