import { ArrowRight } from "lucide-react";
import { DocumentationCoverageBar } from "@/components/explore/insights/DocumentationCoverageBar";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

type CoverageCategory = {
	label: string;
	documented: number;
	total: number;
};

const coverageBreakdown: CoverageCategory[] = [
	{ label: "Container Types", documented: 8, total: 18 },
	{ label: "Fields", documented: 44, total: 72 },
	{ label: "Enums", documented: 0, total: 35 },
	{ label: "Enum Values", documented: 0, total: 84 },
];

const totalElements = coverageBreakdown.reduce(
	(sum, category) => sum + category.total,
	0,
);
const documentedElements = coverageBreakdown.reduce(
	(sum, category) => sum + category.documented,
	0,
);
const undocumentedElements = totalElements - documentedElements;
const overallCoverage = Math.round((documentedElements / totalElements) * 100);

export function DocumentationCoverageCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "undocumented";

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
					<span className="font-semibold">{undocumentedElements}</span> of{" "}
					{totalElements} elements lack descriptions
				</p>
			</div>
			<div className="flex flex-col gap-3">
				{coverageBreakdown.map((category) => (
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
