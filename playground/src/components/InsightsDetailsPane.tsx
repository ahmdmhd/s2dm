import { ArrowLeft, X } from "lucide-react";
import { DetailsPane } from "@/components/DetailsPane";
import { AllIssuesDetail } from "@/components/explore/insights/AllIssuesDetail";
import { ConceptsBreakdownDetail } from "@/components/explore/insights/ConceptsBreakdownDetail";
import { ConceptTypesDetail } from "@/components/explore/insights/ConceptTypesDetail";
import { DeepestPathsDetail } from "@/components/explore/insights/DeepestPathsDetail";
import { EnumsDetail } from "@/components/explore/insights/EnumsDetail";
import { FieldsByKindDetail } from "@/components/explore/insights/FieldsByKindDetail";
import { FieldsByTypeDetail } from "@/components/explore/insights/FieldsByTypeDetail";
import { FieldsByTypeListDetail } from "@/components/explore/insights/FieldsByTypeListDetail";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import { UndocumentedDetail } from "@/components/explore/insights/UndocumentedDetail";
import { UndocumentedListDetail } from "@/components/explore/insights/UndocumentedListDetail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	closeInsightDetail,
	collapseResultPane,
	type InsightDetail,
	popInsightDetail,
	selectCanGoBackInsightDetail,
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
		case "conceptsBreakdown":
			return "Elements breakdown";
		case "conceptDetails":
			return CONCEPT_TITLES[detail.concept];
		case "fieldsByKind":
			return detail.fieldKind === "leaf"
				? "Leaf fields"
				: "Relationship fields";
		case "enumsList":
			return "Enums";
		case "allIssues":
			return "All issues";
		case "fieldsByType":
			return "Container types by fields";
		case "fieldsByTypeList":
			return "All container types";
		case "deepestPaths":
			return "Deepest paths";
		case "undocumented":
			return "Undocumented";
		case "undocumentedList":
			return "All undocumented";
	}
}

function renderDetail(detail: InsightDetail) {
	switch (detail.kind) {
		case "conceptsBreakdown":
			return <ConceptsBreakdownDetail />;
		case "conceptDetails":
			return <ConceptTypesDetail concept={detail.concept} />;
		case "fieldsByKind":
			return <FieldsByKindDetail fieldKind={detail.fieldKind} />;
		case "enumsList":
			return <EnumsDetail />;
		case "allIssues":
			return <AllIssuesDetail />;
		case "fieldsByType":
			return <FieldsByTypeDetail />;
		case "fieldsByTypeList":
			return <FieldsByTypeListDetail />;
		case "deepestPaths":
			return <DeepestPathsDetail />;
		case "undocumented":
			return <UndocumentedDetail />;
		case "undocumentedList":
			return <UndocumentedListDetail />;
	}
}

function detailKey(detail: InsightDetail): string {
	if (detail.kind === "conceptDetails") {
		return `conceptDetails:${detail.concept}`;
	}
	if (detail.kind === "fieldsByKind") {
		return `fieldsByKind:${detail.fieldKind}`;
	}
	return detail.kind;
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
	const canGoBack = useAppSelector(selectCanGoBackInsightDetail);

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
					<div className="flex items-center gap-2">
						{canGoBack && (
							<button
								type="button"
								onClick={() => dispatch(popInsightDetail())}
								className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
								aria-label="Back"
							>
								<ArrowLeft className="h-4 w-4" />
							</button>
						)}
						<span className="text-lg font-semibold text-card-foreground">
							{detailTitle(detail)}
						</span>
					</div>
					<button
						type="button"
						onClick={() => {
							dispatch(closeInsightDetail());
							dispatch(collapseResultPane());
						}}
						className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
						aria-label="Close details"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<div
					key={detailKey(detail)}
					className="flex-1 animate-in overflow-y-auto px-5 pt-5 pb-14 fade-in slide-in-from-right-4 duration-200"
				>
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
