import { X } from "lucide-react";
import { DetailsPane } from "@/components/DetailsPane";
import { AllIssuesDetail } from "@/components/explore/insights/AllIssuesDetail";
import { ConceptTypesDetail } from "@/components/explore/insights/ConceptTypesDetail";
import { DeepestPathsDetail } from "@/components/explore/insights/DeepestPathsDetail";
import { FieldsByTypeDetail } from "@/components/explore/insights/FieldsByTypeDetail";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import { UndocumentedDetail } from "@/components/explore/insights/UndocumentedDetail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	closeInsightDetail,
	type InsightDetail,
	selectInsightDetail,
} from "@/store/ui/uiSlice";

const CONCEPT_TITLES: Record<GraphQLConcept, string> = {
	object: "Object types",
	interface: "Interfaces",
	enum: "Enums",
	union: "Unions",
	scalar: "Scalars",
	input: "Input types",
	field: "Fields",
	directive: "Directives",
};

function detailTitle(detail: InsightDetail): string {
	switch (detail.kind) {
		case "conceptDetails":
			return CONCEPT_TITLES[detail.concept];
		case "allIssues":
			return "All issues";
		case "fieldsByType":
			return "Fields by type";
		case "deepestPaths":
			return "Deepest paths";
		case "undocumented":
			return "Undocumented";
	}
}

function renderDetail(detail: InsightDetail) {
	switch (detail.kind) {
		case "conceptDetails":
			return <ConceptTypesDetail concept={detail.concept} />;
		case "allIssues":
			return <AllIssuesDetail />;
		case "fieldsByType":
			return <FieldsByTypeDetail />;
		case "deepestPaths":
			return <DeepestPathsDetail />;
		case "undocumented":
			return <UndocumentedDetail />;
	}
}

type InsightsDetailsPaneProps = {
	position?: "none" | "left" | "center" | "right";
	collapsible?: boolean;
	className?: string;
};

export function InsightsDetailsPane({
	position = "right",
	collapsible,
	className,
}: InsightsDetailsPaneProps) {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);

	let content: React.ReactNode;
	if (!detail) {
		content = (
			<div className="flex flex-1 items-center justify-center p-5 text-center text-muted-foreground">
				<p>Select a card to see details</p>
			</div>
		);
	} else {
		content = (
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-b px-5 py-4">
					<span className="text-lg font-semibold text-card-foreground">
						{detailTitle(detail)}
					</span>
					<button
						type="button"
						onClick={() => dispatch(closeInsightDetail())}
						className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
						aria-label="Close details"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto px-5 pt-5 pb-14">
					{renderDetail(detail)}
				</div>
			</div>
		);
	}

	return (
		<DetailsPane
			className={className}
			position={position}
			collapsible={collapsible}
		>
			{content}
		</DetailsPane>
	);
}
