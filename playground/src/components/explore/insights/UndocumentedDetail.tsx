import { ArrowRight, Download } from "lucide-react";
import { UndocumentedRow } from "@/components/explore/insights/UndocumentedListDetail";
import { UNDOCUMENTED_BY_KIND } from "@/components/explore/insights/undocumentedData";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { StatusBanner } from "@/components/ui/status-banner";
import { useAppDispatch } from "@/store/hooks";
import { pushInsightDetail } from "@/store/ui/uiSlice";

const ELEMENTS_PER_KIND = 3;

export function UndocumentedDetail() {
	const dispatch = useAppDispatch();

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				How much of the model is documented via doc-string descriptions, and how
				many elements do not contain a description.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<p className="text-muted-foreground">
					A low documentation coverage is undesired because some elements might
					not be self-explainable, and users would have a hard time
					understanding them.
				</p>
				<p className="text-muted-foreground">
					If an element is self-explainable, one might leave it without a
					description. Although 100% is ideal, not achieving it does not imply
					an issue.
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					Check all eligible GraphQL elements and mark those without a
					description as undocumented. Count them and compute the percentage.
				</p>
				<StatusBanner variant="info">
					<span className="font-medium">Note:</span> configured technical root
					types such as Query, Mutation, and Subscription may be excluded from
					documentation coverage.
				</StatusBanner>
			</section>

			<section className="flex flex-col gap-3">
				<Heading level="h3">Evidence</Heading>
				<div className="flex flex-col gap-3">
					<Heading level="h4">Undocumented elements</Heading>
					{UNDOCUMENTED_BY_KIND.map((group, index) => (
						<CollapsibleSection
							key={group.kind}
							title={`${group.kind} (${group.elements.length})`}
							defaultCollapsed={index > 0}
						>
							<ul className="flex flex-col gap-2 py-3">
								{group.elements.slice(0, ELEMENTS_PER_KIND).map((element) => (
									<UndocumentedRow
										key={`${element.kind}:${element.name}`}
										{...element}
									/>
								))}
							</ul>
						</CollapsibleSection>
					))}
					<div className="flex flex-wrap gap-4">
						<button
							type="button"
							onClick={() =>
								dispatch(pushInsightDetail({ kind: "undocumentedList" }))
							}
							className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
						>
							View all
							<ArrowRight className="h-4 w-4" />
						</button>
						<button
							type="button"
							disabled
							className="inline-flex cursor-not-allowed items-center gap-1 self-start text-sm font-medium text-muted-foreground"
						>
							<Download className="h-4 w-4" />
							Download all
						</button>
					</div>
				</div>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Actions</Heading>
				<button
					type="button"
					disabled
					className="inline-flex cursor-not-allowed items-center gap-1 self-start text-sm font-medium text-muted-foreground"
				>
					<Download className="h-4 w-4" />
					Download all
				</button>
			</section>
		</div>
	);
}
