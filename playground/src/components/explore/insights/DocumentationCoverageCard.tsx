import { ArrowRight } from "lucide-react";
import { DocumentationCoverageBar } from "@/components/explore/insights/DocumentationCoverageBar";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const overallCoverage = 25;

const coverageBreakdown: { label: string; percent: number }[] = [
	{ label: "Types", percent: 47 },
	{ label: "Fields", percent: 61 },
	{ label: "Enums", percent: 0 },
	{ label: "Enum Values", percent: 0 },
];

export function DocumentationCoverageCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "undocumented";

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Documentation Coverage
			</span>
			<div className="flex flex-col gap-6 sm:flex-row sm:items-center">
				<div className="flex flex-col">
					<span className="text-4xl font-bold text-green-600 dark:text-green-400">
						{overallCoverage}%
					</span>
					<span className="text-sm text-muted-foreground">
						overall coverage
					</span>
				</div>
				<div className="flex flex-1 flex-col gap-3">
					{coverageBreakdown.map((coverage) => (
						<DocumentationCoverageBar
							key={coverage.label}
							label={coverage.label}
							percent={coverage.percent}
						/>
					))}
				</div>
			</div>
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "undocumented" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View undocumented
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
