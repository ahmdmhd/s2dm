import { ConceptsBreakdown } from "@/components/explore/insights/ConceptsBreakdown";
import { IssueDetailsCard } from "@/components/explore/insights/IssueDetailsCard";
import { QualityIssuesCard } from "@/components/explore/insights/QualityIssuesCard";
import type { SeverityTone } from "@/components/explore/insights/SeverityBadge";
import { TabsContent } from "@/components/ui/tabs";

const totalIssues = 6;

const severityBreakdown: {
	label: string;
	value: number;
	tone: SeverityTone;
}[] = [
	{ label: "Warnings", value: 3, tone: "warning" },
	{ label: "Info", value: 3, tone: "info" },
];

const topIssueTypes: { label: string; count: number }[] = [
	{ label: "Missing descriptions", count: 3 },
	{ label: "Naming convention", count: 1 },
	{ label: "Deprecated fields", count: 1 },
	{ label: "Unused enums", count: 1 },
];

export function OverviewTab() {
	return (
		<TabsContent
			value="overview"
			className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
		>
			<div className="flex flex-col gap-4 p-4">
				<ConceptsBreakdown />
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<QualityIssuesCard
						total={totalIssues}
						severities={severityBreakdown}
					/>
					<IssueDetailsCard
						description="Issues grouped by severity."
						issueTypes={topIssueTypes}
					/>
				</div>
			</div>
		</TabsContent>
	);
}
