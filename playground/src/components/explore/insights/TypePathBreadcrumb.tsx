import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/utils/cn";

export type BreadcrumbTone = "default" | "emphasis";

const BREADCRUMB_TONE_CLASSES: Record<BreadcrumbTone, string> = {
	default: "bg-sky-500/10",
	emphasis: "bg-sky-700/20",
};

type TypePathBreadcrumbProps = {
	segments: string[];
	tone?: BreadcrumbTone;
};

export function TypePathBreadcrumb({
	segments,
	tone = "default",
}: TypePathBreadcrumbProps) {
	return (
		<div
			className={cn(
				"inline-flex flex-wrap items-center gap-1 rounded-md px-2 py-1 text-sm text-card-foreground",
				BREADCRUMB_TONE_CLASSES[tone],
			)}
		>
			{segments.map((segment, index) => (
				<Fragment key={segment}>
					{index > 0 && (
						<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
					)}
					<span>{segment}</span>
				</Fragment>
			))}
		</div>
	);
}
