import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/utils/cn";

export type BreadcrumbTone = "default" | "emphasis";

const BREADCRUMB_TONE_CLASSES: Record<BreadcrumbTone, string> = {
	default: "bg-sky-500/10",
	emphasis: "bg-sky-700/20",
};

const ELLIPSIS = "…";

type TypePathBreadcrumbProps = {
	segments: string[];
	tone?: BreadcrumbTone;
	maxSegments?: number;
};

function collapseSegments(segments: string[], maxSegments: number): string[] {
	if (segments.length <= maxSegments) {
		return segments;
	}
	const head = segments.slice(0, maxSegments - 1);
	return [...head, ELLIPSIS, segments[segments.length - 1]];
}

export function TypePathBreadcrumb({
	segments,
	tone = "default",
	maxSegments,
}: TypePathBreadcrumbProps) {
	const displaySegments = maxSegments
		? collapseSegments(segments, maxSegments)
		: segments;

	return (
		<div
			className={cn(
				"inline-flex flex-wrap items-center gap-1 rounded-md px-2 py-1 text-sm text-card-foreground",
				BREADCRUMB_TONE_CLASSES[tone],
			)}
		>
			{displaySegments.map((segment, index) => (
				<Fragment key={segment}>
					{index > 0 && (
						<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
					)}
					<span className={cn(segment === ELLIPSIS && "text-muted-foreground")}>
						{segment}
					</span>
				</Fragment>
			))}
		</div>
	);
}
