import { ArrowRight } from "lucide-react";
import type { DeepestPath } from "@/components/explore/insights/DeepestPathsCard";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { TypePathTree } from "@/components/explore/insights/TypePathTree";
import { useAppDispatch } from "@/store/hooks";
import { setExploreTab } from "@/store/ui/uiSlice";

type MaxDepthCardProps = {
	deepestPath: DeepestPath;
};

export function MaxDepthCard({ deepestPath }: MaxDepthCardProps) {
	const dispatch = useAppDispatch();

	return (
		<HighlightableCard>
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">Max depth</span>
				<span className="text-3xl font-bold text-card-foreground">
					{deepestPath.depth}
				</span>
			</div>
			<div className="h-px w-full bg-border" />
			<div className="flex flex-col gap-2">
				<span className="text-sm text-muted-foreground">Path</span>
				<TypePathTree segments={deepestPath.segments} />
			</div>
			<button
				type="button"
				onClick={() => dispatch(setExploreTab("explorer"))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				See path in Explorer
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
