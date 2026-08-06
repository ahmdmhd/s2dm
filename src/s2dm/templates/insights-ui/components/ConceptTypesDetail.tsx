import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import type { GraphQLConcept } from "@insights-ui/components/graphqlConceptStyles";
import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";
import {
	selectConceptMembers,
	selectFieldGroups,
} from "@insights-ui/selectors/concepts";
import { useInsightsSelector } from "@insights-ui/state/hooks";

type ConceptTypesDetailProps = {
	concept: GraphQLConcept;
};

export function ConceptTypesDetail({ concept }: ConceptTypesDetailProps) {
	const members = useInsightsSelector(selectConceptMembers);
	const fieldGroups = useInsightsSelector(selectFieldGroups);
	let conceptMembers: string[] = [];
	if (members && concept !== "field") {
		conceptMembers = members[concept];
	}

	if (concept === "field") {
		return (
			<div className="flex flex-col gap-2 text-sm">
				{fieldGroups.map((group) => (
					<EvidenceRow key={group.type} className="flex flex-col gap-2">
						<div className="flex">
							<TypePathBreadcrumb segments={[group.type]} tone="emphasis" />
						</div>
						{group.fields.map((field) => (
							<div key={field} className="flex items-center gap-1 pl-3">
								<span className="shrink-0 text-muted-foreground">└</span>
								<TypePathBreadcrumb segments={[field]} />
							</div>
						))}
					</EvidenceRow>
				))}
			</div>
		);
	}

	return (
		<PagedList
			items={conceptMembers}
			getKey={(member) => member}
			renderItem={(member) => (
				<li>
					<EvidenceRow className="flex text-sm">
						<TypePathBreadcrumb segments={[member]} />
					</EvidenceRow>
				</li>
			)}
		/>
	);
}
