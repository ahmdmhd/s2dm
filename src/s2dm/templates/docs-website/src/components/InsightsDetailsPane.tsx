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
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
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
	type InsightDetail,
	popInsightDetail,
	selectCanGoBackInsightDetail,
	selectInsightDetail,
} from "@/store/ui/uiSlice";

type InsightDetailView = {
	key: string;
	content: React.ReactNode;
};

function getInsightDetailView(detail: InsightDetail): InsightDetailView {
	switch (detail.kind) {
		case "conceptsBreakdown":
			return {
				key: detail.kind,
				content: <ConceptsBreakdownDetail />,
			};
		case "conceptDetails":
			return {
				key: `conceptDetails:${detail.concept}`,
				content: <ConceptTypesDetail concept={detail.concept} />,
			};
		case "fieldsByKind":
			return {
				key: `fieldsByKind:${detail.fieldKind}`,
				content: <FieldsByKindDetail fieldKind={detail.fieldKind} />,
			};
		case "enumsList":
			return {
				key: detail.kind,
				content: <EnumsDetail />,
			};
		case "fieldsByType":
			return {
				key: detail.kind,
				content: <FieldsByTypeDetail />,
			};
		case "fieldsByTypeList":
			return {
				key: detail.kind,
				content: <FieldsByTypeListDetail />,
			};
		case "scalarDistribution":
			return {
				key: detail.kind,
				content: <ScalarDistributionDetail />,
			};
		case "scalarDistributionList":
			return {
				key: detail.kind,
				content: <ScalarDistributionListDetail />,
			};
		case "enumUsage":
			return {
				key: detail.kind,
				content: <EnumUsageDetail />,
			};
		case "enumUsageList":
			return {
				key: detail.kind,
				content: <EnumUsageListDetail />,
			};
		case "references":
			return {
				key: detail.kind,
				content: <ReferencesCountDetail />,
			};
		case "referencesList":
			return {
				key: detail.kind,
				content: <ReferencesCountListDetail />,
			};
		case "deepestPaths":
			return {
				key: detail.kind,
				content: <DeepestPathsDetail />,
			};
		case "pathsByDepth":
			return {
				key: `pathsByDepth:${detail.depth}`,
				content: <PathsByDepthDetail depth={detail.depth} />,
			};
		case "cyclicReferences":
			return {
				key: detail.kind,
				content: <CyclicReferencesDetail />,
			};
		case "undocumented":
			return {
				key: detail.kind,
				content: <UndocumentedDetail />,
			};
		case "undocumentedList":
			return {
				key: `undocumentedList:${detail.entityKind}`,
				content: <UndocumentedListDetail entityKind={detail.entityKind} />,
			};
		case "unused":
			return {
				key: detail.kind,
				content: <UnusedElementsDetail />,
			};
		case "unusedList":
			return {
				key: `unusedList:${detail.category}`,
				content: <UnusedElementsListDetail category={detail.category} />,
			};
		case "missingUnits":
			return {
				key: detail.kind,
				content: <MissingUnitsDetail />,
			};
		case "missingUnitsList":
			return {
				key: detail.kind,
				content: <MissingUnitsListDetail />,
			};
	}
}

export function InsightsDetailsPane() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const canGoBack = useAppSelector(selectCanGoBackInsightDetail);
	const detailView = detail ? getInsightDetailView(detail) : null;

	if (!detailView) {
		return (
			<div className="flex flex-1 items-center justify-center p-5 text-center text-muted-foreground">
				<p>Select a card to see details</p>
			</div>
		);
	}

	return (
		<section className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
			<div
				key={detailView.key}
				className="flex flex-col gap-4 px-5 pt-5 pb-8"
			>
				{canGoBack && (
					<InsightLinkButton
						label="Back"
						direction="back"
						onClick={() => dispatch(popInsightDetail())}
					/>
				)}
				<span className="text-lg font-semibold text-card-foreground">
					Details
				</span>
				{detailView.content}
			</div>
		</section>
	);
}
