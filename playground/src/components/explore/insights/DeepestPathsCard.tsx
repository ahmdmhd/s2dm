import { ArrowRight } from "lucide-react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";
import { cn } from "@/utils/cn";

export type DeepestPath = {
	segments: string[];
	depth: number;
};

type DeepestPathsCardProps = {
	paths: DeepestPath[];
};

export function DeepestPathsCard({ paths }: DeepestPathsCardProps) {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "deepestPaths";

	return (
		<HighlightableCard selected={selected}>
			<div className="flex flex-col">
				{paths.map((path, index) => (
					<div
						key={path.segments.join(">")}
						className={cn(
							"flex items-center justify-between gap-4 py-3",
							index > 0 && "border-t border-border",
						)}
					>
						<TypePathBreadcrumb segments={path.segments} />
						<span className="text-sm font-bold text-card-foreground">
							{path.depth}
						</span>
					</div>
				))}
			</div>
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "deepestPaths" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View all deepest paths
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
