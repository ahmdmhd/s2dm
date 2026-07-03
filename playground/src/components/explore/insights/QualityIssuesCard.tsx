import { TriangleAlert } from "lucide-react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import {
	SeverityBadge,
	type SeverityTone,
} from "@/components/explore/insights/SeverityBadge";

type SeverityBreakdown = {
	label: string;
	value: number;
	tone: SeverityTone;
};

type QualityIssuesCardProps = {
	total: number | string;
	severities: SeverityBreakdown[];
};

export function QualityIssuesCard({
	total,
	severities,
}: QualityIssuesCardProps) {
	return (
		<HighlightableCard>
			<div className="flex items-center justify-between">
				<span className="text-lg font-semibold text-card-foreground">
					Quality issues
				</span>
				<TriangleAlert className="h-5 w-5 text-muted-foreground" />
			</div>
			<div className="flex flex-col">
				<span className="text-3xl font-bold text-card-foreground">{total}</span>
				<span className="text-sm text-muted-foreground">total issues</span>
			</div>
			<div className="flex gap-6">
				{severities.map((severity) => (
					<SeverityBadge
						key={severity.label}
						label={severity.label}
						value={severity.value}
						tone={severity.tone}
					/>
				))}
			</div>
		</HighlightableCard>
	);
}
