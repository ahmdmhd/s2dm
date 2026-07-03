import { ConceptsCount } from "@/components/explore/insights/ConceptsCount";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import { IssueDetailsCard } from "@/components/explore/insights/IssueDetailsCard";
import { QualityIssuesCard } from "@/components/explore/insights/QualityIssuesCard";
import type { SeverityTone } from "@/components/explore/insights/SeverityBadge";
import { TabsContent } from "@/components/ui/tabs";

const conceptCounts: {
	label: string;
	value: number;
	concept: GraphQLConcept;
}[] = [
	{ label: "Total Object Types", value: 17, concept: "object" },
	{ label: "Total Interfaces", value: 3, concept: "interface" },
	{ label: "Total Enums", value: 35, concept: "enum" },
	{ label: "Total Unions", value: 2, concept: "union" },
	{ label: "Total Scalars", value: 7, concept: "scalar" },
	{ label: "Total Input Types", value: 2, concept: "input" },
	{ label: "Total Fields / Properties", value: 70, concept: "field" },
	{ label: "Total Directives", value: 5, concept: "directive" },
];

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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{conceptCounts.map((conceptCount) => (
						<ConceptsCount
							key={conceptCount.label}
							label={conceptCount.label}
							value={conceptCount.value}
							concept={conceptCount.concept}
						/>
					))}
				</div>
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
