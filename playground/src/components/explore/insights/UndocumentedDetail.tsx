import { UndocumentedRow } from "@/components/explore/insights/UndocumentedListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { StatusBanner } from "@/components/ui/status-banner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUndocumentedByKind } from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

const ELEMENTS_PER_KIND = 3;

export function UndocumentedDetail() {
	const dispatch = useAppDispatch();
	const undocumentedByKind = useAppSelector(selectUndocumentedByKind);

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
				<ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
					<li>
						Types = object types + interface types + input object types + union
						types + custom scalar types
					</li>
					<li>
						Fields = fields declared on object types, interfaces, and input
						object types
					</li>
					<li>Enums = enum type definitions</li>
					<li>Enum values = values declared within each enum</li>
					<li>
						Directives = custom directive definitions, excluding built-in
						directives such as @deprecated, @skip, and @include
					</li>
				</ul>
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
					{undocumentedByKind.map((group) => (
						<CollapsibleSection
							key={group.kind}
							title={`${group.kind} (${group.elements.length})`}
							defaultCollapsed
						>
							<div className="flex flex-col gap-2 py-3">
								<ul className="flex flex-col gap-2">
									{group.elements.slice(0, ELEMENTS_PER_KIND).map((element) => (
										<UndocumentedRow
											key={`${element.kind}:${element.name}`}
											{...element}
										/>
									))}
								</ul>
								{group.elements.length > ELEMENTS_PER_KIND && (
									<ViewAllButton
										label={`View all ${group.elements.length}`}
										onClick={() =>
											dispatch(
												pushInsightDetail({
													kind: "undocumentedList",
													entityKind: group.kind,
												}),
											)
										}
									/>
								)}
							</div>
						</CollapsibleSection>
					))}
				</div>
			</section>
		</div>
	);
}
