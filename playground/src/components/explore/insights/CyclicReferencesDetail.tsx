import { useState } from "react";
import type { CyclicReference } from "@/api/types";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { TypePathTree } from "@/components/explore/insights/TypePathTree";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { useAppSelector } from "@/store/hooks";
import { selectCycleGroups } from "@/store/insights/insightsSelectors";

function CycleRow({ cycle }: { cycle: CyclicReference }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<li className="rounded-md border border-border">
			<button
				type="button"
				onClick={() => setExpanded((open) => !open)}
				className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left"
			>
				<TypePathBreadcrumb segments={cycle.segments} maxSegments={5} />
				<span className="shrink-0 text-sm">
					<span className="font-bold text-card-foreground">{cycle.length}</span>{" "}
					<span className="text-muted-foreground">hops</span>
				</span>
			</button>
			{expanded && (
				<div className="border-t border-border px-3 py-2">
					<TypePathTree segments={cycle.segments} />
				</div>
			)}
		</li>
	);
}

export function CyclicReferencesDetail() {
	const cycleGroups = useAppSelector(selectCycleGroups);

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				These are reference loops where following a chain of relationship fields
				leads back to a type already visited earlier in the chain.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<p className="text-muted-foreground">
					A cycle of length 1 is a self-reference: a type has a relationship
					field that points back to itself.
				</p>
				<p className="text-muted-foreground">
					A longer cycle passes through several types before returning to the
					type it started from.
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					Traverse every container type along its relationship fields. When a
					traversal reaches a type already on the current path, the loop from
					that type back to itself is recorded as a cyclic reference.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<Heading level="h3">Evidence</Heading>
				{cycleGroups.length === 0 && (
					<p className="text-muted-foreground">
						No cyclic references detected.
					</p>
				)}
				{cycleGroups.map((group) => (
					<CollapsibleSection
						key={group.length}
						title={`Length ${group.length}`}
						defaultCollapsed
					>
						<div className="flex flex-col gap-2 py-3">
							<ul className="flex flex-col gap-2">
								{group.cycles.map((cycle) => (
									<CycleRow key={cycle.segments.join(">")} cycle={cycle} />
								))}
							</ul>
						</div>
					</CollapsibleSection>
				))}
			</section>
		</div>
	);
}
