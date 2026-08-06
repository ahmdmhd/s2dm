import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import { TypePathTree } from "@insights-ui/components/TypePathTree";
import { useState } from "react";

type ExpandableTypePathRowProps = {
	segments: string[];
	metric: number;
	metricLabel: string;
};

export function ExpandableTypePathRow({
	segments,
	metric,
	metricLabel,
}: ExpandableTypePathRowProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<li>
			<EvidenceRow padded={false}>
				<button
					type="button"
					onClick={() => setExpanded((open) => !open)}
					className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left"
				>
					<div className="min-w-0 flex-1 overflow-x-auto">
						<TypePathBreadcrumb segments={segments} scrollable />
					</div>
					<span className="shrink-0 text-sm">
						<span className="font-bold text-card-foreground">{metric}</span>{" "}
						<span className="text-muted-foreground">{metricLabel}</span>
					</span>
				</button>
				{expanded && (
					<div className="border-t border-border px-3 py-2">
						<TypePathTree segments={segments} />
					</div>
				)}
			</EvidenceRow>
		</li>
	);
}
