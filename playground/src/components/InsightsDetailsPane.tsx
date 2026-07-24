import { ArrowLeft, X } from "lucide-react";
import { DetailsPane } from "@/components/DetailsPane";
import { ConceptsBreakdownDetail } from "@/components/explore/insights/ConceptsBreakdownDetail";
import { ConceptTypesDetail } from "@/components/explore/insights/ConceptTypesDetail";
import { CyclicReferencesDetail } from "@/components/explore/insights/CyclicReferencesDetail";
import { DeepestPathsDetail } from "@/components/explore/insights/DeepestPathsDetail";
import { EnumsDetail } from "@/components/explore/insights/EnumsDetail";
import { EnumUsageDetail } from "@/components/explore/insights/EnumUsageDetail";
import { EnumUsageListDetail } from "@/components/explore/insights/EnumUsageListDetail";
import { FieldsByKindDetail } from "@/components/explore/insights/FieldsByKindDetail";
import { FieldsByTypeDetail } from "@/components/explore/insights/FieldsByTypeDetail";
import { FieldsByTypeListDetail } from "@/components/explore/insights/FieldsByTypeListDetail";
import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import { MissingUnitsDetail } from "@/components/explore/insights/MissingUnitsDetail";
import { MissingUnitsListDetail } from "@/components/explore/insights/MissingUnitsListDetail";
import { PathsByDepthDetail } from "@/components/explore/insights/PathsByDepthDetail";
import { ReferencesCountDetail } from "@/components/explore/insights/ReferencesCountDetail";
import { ReferencesCountListDetail } from "@/components/explore/insights/ReferencesCountListDetail";
import { ScalarDistributionDetail } from "@/components/explore/insights/ScalarDistributionDetail";
import { ScalarDistributionListDetail } from "@/components/explore/insights/ScalarDistributionListDetail";
import { UndocumentedDetail } from "@/components/explore/insights/UndocumentedDetail";
import { UndocumentedListDetail } from "@/components/explore/insights/UndocumentedListDetail";
import { UnusedElementsDetail } from "@/components/explore/insights/UnusedElementsDetail";
import { UnusedElementsListDetail } from "@/components/explore/insights/UnusedElementsListDetail";
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

type InsightsDetailsPaneProps = {
	position?: "none" | "left" | "center" | "right";
	collapsible?: boolean;
	className?: string;
};

type InsightDetailView = {
	title: string;
	key: string;
	content: React.ReactNode;
};

function getInsightDetailView(detail: InsightDetail): InsightDetailView {
	switch (detail.kind) {
		case "conceptsBreakdown":
			return {
				title: "Elements breakdown",
				key: detail.kind,
				content: <ConceptsBreakdownDetail />,
			};
		case "conceptDetails":
			return {
				title: CONCEPT_TITLES[detail.concept],
				key: `conceptDetails:${detail.concept}`,
				content: <ConceptTypesDetail concept={detail.concept} />,
			};
		case "fieldsByKind":
			return {
				title:
					detail.fieldKind === "leaf" ? "Leaf fields" : "Relationship fields",
				key: `fieldsByKind:${detail.fieldKind}`,
				content: <FieldsByKindDetail fieldKind={detail.fieldKind} />,
			};
		case "enumsList":
			return {
				title: "Enums",
				key: detail.kind,
				content: <EnumsDetail />,
			};
		case "fieldsByType":
			return {
				title: "Largest Container Types by Fields",
				key: detail.kind,
				content: <FieldsByTypeDetail />,
			};
		case "fieldsByTypeList":
			return {
				title: "All container types",
				key: detail.kind,
				content: <FieldsByTypeListDetail />,
			};
		case "scalarDistribution":
			return {
				title: "Scalar Distribution",
				key: detail.kind,
				content: <ScalarDistributionDetail />,
			};
		case "scalarDistributionList":
			return {
				title: "All datatypes",
				key: detail.kind,
				content: <ScalarDistributionListDetail />,
			};
		case "enumUsage":
			return {
				title: "Enum Usage",
				key: detail.kind,
				content: <EnumUsageDetail />,
			};
		case "enumUsageList":
			return {
				title: "All enums by usage",
				key: detail.kind,
				content: <EnumUsageListDetail />,
			};
		case "references":
			return {
				title: "References Count",
				key: detail.kind,
				content: <ReferencesCountDetail />,
			};
		case "referencesList":
			return {
				title: "All references",
				key: detail.kind,
				content: <ReferencesCountListDetail />,
			};
		case "deepestPaths":
			return {
				title: "Deepest Nested Paths",
				key: detail.kind,
				content: <DeepestPathsDetail />,
			};
		case "pathsByDepth":
			return {
				title: `Depth ${detail.depth}`,
				key: `pathsByDepth:${detail.depth}`,
				content: <PathsByDepthDetail depth={detail.depth} />,
			};
		case "cyclicReferences":
			return {
				title: "Cyclic References",
				key: detail.kind,
				content: <CyclicReferencesDetail />,
			};
		case "undocumented":
			return {
				title: "Documentation Coverage",
				key: detail.kind,
				content: <UndocumentedDetail />,
			};
		case "undocumentedList":
			return {
				title: detail.entityKind,
				key: `undocumentedList:${detail.entityKind}`,
				content: <UndocumentedListDetail entityKind={detail.entityKind} />,
			};
		case "unused":
			return {
				title: "Unused Elements",
				key: detail.kind,
				content: <UnusedElementsDetail />,
			};
		case "unusedList":
			return {
				title: detail.category,
				key: `unusedList:${detail.category}`,
				content: <UnusedElementsListDetail category={detail.category} />,
			};
		case "missingUnits":
			return {
				title: "Missing Units",
				key: detail.kind,
				content: <MissingUnitsDetail />,
			};
		case "missingUnitsList":
			return {
				title: "All fields without a unit",
				key: detail.kind,
				content: <MissingUnitsListDetail />,
			};
	}
}

export function InsightsDetailsPane({
	position = "right",
	collapsible,
	className,
}: InsightsDetailsPaneProps) {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const canGoBack = useAppSelector(selectCanGoBackInsightDetail);
	const detailView = detail ? getInsightDetailView(detail) : null;

	let content: React.ReactNode;
	if (!detailView) {
		content = (
			<div className="flex flex-1 items-center justify-center p-5 text-center text-muted-foreground">
				<p>Select a card to see details</p>
			</div>
		);
	} else {
		content = (
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-b px-5 py-4">
					<div className="flex min-w-0 items-center gap-2">
						{canGoBack && (
							<button
								type="button"
								onClick={() => dispatch(popInsightDetail())}
								className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
								aria-label="Back"
							>
								<ArrowLeft className="h-4 w-4" />
							</button>
						)}
						<span className="truncate text-lg font-semibold text-card-foreground">
							{detailView.title}
						</span>
					</div>
					<button
						type="button"
						onClick={() => {
							dispatch(closeInsightDetail());
							dispatch(collapseResultPane());
						}}
						className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
						aria-label="Close details"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<div
					key={detailView.key}
					className="flex-1 animate-in overflow-y-auto px-5 pt-5 pb-14 fade-in slide-in-from-right-4 duration-200"
				>
					{detailView.content}
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
