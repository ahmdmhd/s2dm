import { ConceptsBreakdownDetail } from "@insights-ui/components/ConceptsBreakdownDetail";
import { ConceptTypesDetail } from "@insights-ui/components/ConceptTypesDetail";
import { CyclicReferencesDetail } from "@insights-ui/components/CyclicReferencesDetail";
import { DeepestPathsDetail } from "@insights-ui/components/DeepestPathsDetail";
import { EnumsDetail } from "@insights-ui/components/EnumsDetail";
import { EnumUsageDetail } from "@insights-ui/components/EnumUsageDetail";
import { EnumUsageListDetail } from "@insights-ui/components/EnumUsageListDetail";
import { FieldsByKindDetail } from "@insights-ui/components/FieldsByKindDetail";
import { FieldsByTypeDetail } from "@insights-ui/components/FieldsByTypeDetail";
import { FieldsByTypeListDetail } from "@insights-ui/components/FieldsByTypeListDetail";
import type { GraphQLConcept } from "@insights-ui/components/graphqlConceptStyles";
import { MissingUnitsDetail } from "@insights-ui/components/MissingUnitsDetail";
import { MissingUnitsListDetail } from "@insights-ui/components/MissingUnitsListDetail";
import { PathsByDepthDetail } from "@insights-ui/components/PathsByDepthDetail";
import { ReferencesCountDetail } from "@insights-ui/components/ReferencesCountDetail";
import { ReferencesCountListDetail } from "@insights-ui/components/ReferencesCountListDetail";
import { ScalarDistributionDetail } from "@insights-ui/components/ScalarDistributionDetail";
import { ScalarDistributionListDetail } from "@insights-ui/components/ScalarDistributionListDetail";
import { UndocumentedDetail } from "@insights-ui/components/UndocumentedDetail";
import { UndocumentedListDetail } from "@insights-ui/components/UndocumentedListDetail";
import { UnusedElementsDetail } from "@insights-ui/components/UnusedElementsDetail";
import { UnusedElementsListDetail } from "@insights-ui/components/UnusedElementsListDetail";
import type { InsightDetail } from "@insights-ui/state/insightDetailSlice";
import type { ReactNode } from "react";

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

export type InsightDetailView = {
	title: string;
	key: string;
	content: ReactNode;
};

/**
 * Resolve the pane contents for one entry of the insight detail stack.
 *
 * Hosts wrap the result in their own chrome — a collapsible side pane in one, an
 * inline section in the other — so only the title, the remount key and the body
 * are decided here.
 *
 * @param detail - The detail entry currently on top of the stack.
 * @returns The heading, a key that changes whenever the body should remount, and
 *   the body itself.
 */
export function getInsightDetailView(detail: InsightDetail): InsightDetailView {
	switch (detail.kind) {
		case "conceptsBreakdown":
			return {
				title: "Elements Breakdown",
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
