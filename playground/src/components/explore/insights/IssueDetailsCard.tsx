import { ArrowRight } from "lucide-react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

type IssueType = {
	label: string;
	count: number;
};

type IssueDetailsCardProps = {
	description: string;
	issueTypes: IssueType[];
};

export function IssueDetailsCard({
	description,
	issueTypes,
}: IssueDetailsCardProps) {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "allIssues";

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Details
			</span>
			<p className="text-sm text-muted-foreground">{description}</p>
			<div className="h-px w-full bg-border" />
			<div className="flex flex-col gap-3">
				<span className="text-sm font-semibold text-card-foreground">
					Top issue types
				</span>
				<ul className="flex flex-col gap-2">
					{issueTypes.map((issueType) => (
						<li
							key={issueType.label}
							className="flex items-center justify-between text-sm"
						>
							<span className="flex items-center gap-2 text-muted-foreground">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								{issueType.label}
							</span>
							<span className="text-muted-foreground">{issueType.count}</span>
						</li>
					))}
				</ul>
			</div>
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "allIssues" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View all issues
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
