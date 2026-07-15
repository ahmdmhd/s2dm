import { Download } from "lucide-react";
import { useState } from "react";
import {
	DEPTH_GROUPS,
	type TypePath,
} from "@/components/explore/insights/deepestPathsData";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { TypePathTree } from "@/components/explore/insights/TypePathTree";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";

const PATHS_PER_GROUP = 3;

function DownloadButton({ label }: { label: string }) {
	return (
		<button
			type="button"
			disabled
			className="mt-1 inline-flex cursor-not-allowed items-center gap-1 self-start text-sm font-medium text-muted-foreground"
		>
			<Download className="h-4 w-4" />
			{label}
		</button>
	);
}

function PathRow({ path }: { path: TypePath }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<li className="rounded-md border border-border">
			<button
				type="button"
				onClick={() => setExpanded((open) => !open)}
				className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left"
			>
				<TypePathBreadcrumb segments={path.segments} maxSegments={5} />
				<span className="shrink-0 text-sm">
					<span className="font-bold text-card-foreground">{path.depth}</span>{" "}
					<span className="text-muted-foreground">deep</span>
				</span>
			</button>
			{expanded && (
				<div className="border-t border-border px-3 py-2">
					<TypePathTree segments={path.segments} />
				</div>
			)}
		</li>
	);
}

export function DeepestPathsDetail() {
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
				{DEPTH_GROUPS.map((group) => (
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
							<DownloadButton
								label={`Download all with depth ${group.depth}`}
							/>
						</div>
					</CollapsibleSection>
				))}
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Actions</Heading>
				<DownloadButton label="Download all" />
			</section>
		</div>
	);
}
