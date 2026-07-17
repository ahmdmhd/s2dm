import type { GraphQLConcept } from "@/components/explore/insights/graphqlConceptStyles";
import { ListPagination } from "@/components/explore/insights/ListPagination";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { usePagedItems } from "@/hooks/usePagedItems";
import { useAppSelector } from "@/store/hooks";
import {
	selectConceptMembers,
	selectFieldGroups,
} from "@/store/insights/insightsSelectors";

type ConceptTypesDetailProps = {
	concept: GraphQLConcept;
};

export function ConceptTypesDetail({ concept }: ConceptTypesDetailProps) {
	const members = useAppSelector(selectConceptMembers);
	const fieldGroups = useAppSelector(selectFieldGroups);
	let conceptMembers: string[] = [];
	if (members && concept !== "field") {
		conceptMembers = members[concept];
	}
	const { visibleItems, hasMore, shown, total, pageSize, showMore } =
		usePagedItems(conceptMembers);

	if (concept === "field") {
		return (
			<div className="flex flex-col gap-2 text-sm">
				{fieldGroups.map((group) => (
					<div
						key={group.type}
						className="flex flex-col gap-2 rounded-md border border-border px-3 py-2"
					>
						<div className="flex">
							<TypePathBreadcrumb segments={[group.type]} tone="emphasis" />
						</div>
						{group.fields.map((field) => (
							<div key={field} className="flex items-center gap-1 pl-3">
								<span className="shrink-0 text-muted-foreground">└</span>
								<TypePathBreadcrumb segments={[field]} />
							</div>
						))}
					</div>
				))}
			</div>
		);
	}

	if (!members) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleItems.map((member) => (
					<li
						key={member}
						className="flex rounded-md border border-border px-3 py-2 text-sm"
					>
						<TypePathBreadcrumb segments={[member]} />
					</li>
				))}
			</ul>
			<ListPagination
				shown={shown}
				total={total}
				hasMore={hasMore}
				pageSize={pageSize}
				onShowMore={showMore}
			/>
		</div>
	);
}
