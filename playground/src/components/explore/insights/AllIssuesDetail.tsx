import {
	SEVERITY_TONE_CLASSES,
	type SeverityTone,
} from "@/components/explore/insights/SeverityBadge";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { cn } from "@/utils/cn";

const issues: { target: string; problem: string; severity: SeverityTone }[] = [
	{
		target: "chargingStation",
		problem: "Does not follow PascalCase convention",
		severity: "warning",
	},
	{
		target: "Seat.massage",
		problem: "Deprecated field still in use",
		severity: "warning",
	},
	{ target: "Person", problem: "Missing description", severity: "info" },
	{
		target: "DrivingJourney",
		problem: "Missing description",
		severity: "info",
	},
	{
		target: "TwoRowsInCabinEnum",
		problem: "Missing description",
		severity: "info",
	},
	{ target: "Work_Unit_Enum", problem: "Unused enum", severity: "warning" },
];

export function AllIssuesDetail() {
	return (
		<ul className="flex flex-col gap-2">
			{issues.map((issue) => (
				<li
					key={`${issue.target}:${issue.problem}`}
					className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
				>
					<div className="flex min-w-0 items-center gap-2">
						<TypePathBreadcrumb segments={issue.target.split(".")} />
						<span className="text-muted-foreground">{issue.problem}</span>
					</div>
					<span
						className={cn(
							"shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
							SEVERITY_TONE_CLASSES[issue.severity],
						)}
					>
						{issue.severity}
					</span>
				</li>
			))}
		</ul>
	);
}
