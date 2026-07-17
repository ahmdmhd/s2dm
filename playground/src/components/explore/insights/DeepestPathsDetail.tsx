import { PathRow } from "@/components/explore/insights/PathsByDepthDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectDepthGroups } from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

const PATHS_PER_GROUP = 3;

export function DeepestPathsDetail() {
	const dispatch = useAppDispatch();
	const depthGroups = useAppSelector(selectDepthGroups);

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				These are the longest traversal paths created by fields that reference
				other object types.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<p className="text-muted-foreground">
					A path with depth 1 means that one container type A relates to another
					container type B, and B has no further relations to another type.
				</p>
				<p className="text-muted-foreground">
					The deepest path is the maximum number of hops found in the model.
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					Traverse every container type as if it would be a root. Count the
					maximum number of type-to-type steps, and stop traversal when a cycle
					is detected.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<Heading level="h3">Evidence</Heading>
				{depthGroups.map((group) => (
					<CollapsibleSection
						key={group.depth}
						title={`Depth ${group.depth}`}
						defaultCollapsed
					>
						<div className="flex flex-col gap-2 py-3">
							<ul className="flex flex-col gap-2">
								{group.paths.slice(0, PATHS_PER_GROUP).map((path) => (
									<PathRow key={path.segments.join(">")} path={path} />
								))}
							</ul>
							{group.paths.length > PATHS_PER_GROUP && (
								<ViewAllButton
									label={`View all ${group.paths.length}`}
									onClick={() =>
										dispatch(
											pushInsightDetail({
												kind: "pathsByDepth",
												depth: group.depth,
											}),
										)
									}
								/>
							)}
						</div>
					</CollapsibleSection>
				))}
			</section>
		</div>
	);
}
