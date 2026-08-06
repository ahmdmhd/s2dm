import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import {
	type FieldWithType,
	selectLeafFields,
	selectRelationshipFields,
} from "@insights-ui/selectors/concepts";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { ContainerKind } from "@insights-ui/types/concepts";
import { ArrowRight } from "lucide-react";

export const CONTAINER_KIND_DOT_CLASSES: Record<ContainerKind, string> = {
	object: "bg-sky-500",
	interface: "bg-purple-500",
	input: "bg-emerald-500",
};

export function FieldTypeRow({ field, target }: FieldWithType) {
	return (
		<li>
			<EvidenceRow className="flex items-center gap-2">
				<TypePathBreadcrumb segments={field.split(".")} />
				<ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
				<span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-xs text-card-foreground">
					{target}
				</span>
			</EvidenceRow>
		</li>
	);
}

type FieldsByKindDetailProps = {
	fieldKind: "leaf" | "relationship";
};

export function FieldsByKindDetail({ fieldKind }: FieldsByKindDetailProps) {
	const leafFields = useInsightsSelector(selectLeafFields);
	const relationshipFields = useInsightsSelector(selectRelationshipFields);
	const fields = fieldKind === "relationship" ? relationshipFields : leafFields;

	return (
		<PagedList
			items={fields}
			getKey={(entry) => entry.field}
			renderItem={(entry) => <FieldTypeRow {...entry} />}
		/>
	);
}
