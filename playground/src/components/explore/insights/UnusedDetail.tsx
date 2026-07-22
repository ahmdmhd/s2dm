import { UnusedRow } from "@/components/explore/insights/UnusedListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUnusedByCategory } from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

const ELEMENTS_PER_CATEGORY = 3;

export function UnusedDetail() {
	const dispatch = useAppDispatch();
	const unusedByCategory = useAppSelector(selectUnusedByCategory);

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				Elements that are defined in the model but never referenced by any field
				or argument.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<p className="text-muted-foreground">
					Unused elements add noise to the model and may indicate dead
					definitions or wiring that was never completed.
				</p>
				<p className="text-muted-foreground">
					Keeping an unused element can be intentional, for example when it is
					reserved for future use. It does not necessarily imply an issue.
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					A type is unused when nothing references it: no field, argument, union
					member, or interface implementation points to it, and it is not a root
					operation type. A directive is unused when it is defined but never
					applied to any element.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<Heading level="h3">Evidence</Heading>
				<div className="flex flex-col gap-3">
					<Heading level="h4">Unused elements</Heading>
					{unusedByCategory.map((group) => (
						<CollapsibleSection
							key={group.category}
							title={`${group.category} (${group.elements.length})`}
							defaultCollapsed
						>
							<div className="flex flex-col gap-2 py-3">
								<ul className="flex flex-col gap-2">
									{group.elements
										.slice(0, ELEMENTS_PER_CATEGORY)
										.map((element) => (
											<UnusedRow
												key={`${element.category}:${element.target}`}
												{...element}
											/>
										))}
								</ul>
								{group.elements.length > ELEMENTS_PER_CATEGORY && (
									<ViewAllButton
										label={`View all ${group.elements.length}`}
										onClick={() =>
											dispatch(
												pushInsightDetail({
													kind: "unusedList",
													category: group.category,
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
