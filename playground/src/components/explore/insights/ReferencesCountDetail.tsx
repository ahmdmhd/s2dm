import { ArrowRight } from "lucide-react";
import { ReferenceCountRow } from "@/components/explore/insights/ReferencesCountListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { Heading } from "@/components/ui/heading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectReferenceCountStats,
	selectReferenceCounts,
} from "@/store/insights/insightsSelectors";
import {
	openInsightDetail,
	pushInsightDetail,
	setInsightsSubTab,
} from "@/store/ui/uiSlice";

export function ReferencesCountDetail() {
	const dispatch = useAppDispatch();
	const referenceCounts = useAppSelector(selectReferenceCounts);
	const stats = useAppSelector(selectReferenceCountStats);

	if (!stats) {
		return null;
	}

	const { mostReferenced, leastReferenced } = stats;
	const topReferences = referenceCounts.slice(0, 5);
	const statRows = [
		{ label: "Types & directives referenced", value: stats.referencedCount },
		{ label: "Total references", value: stats.totalReferences },
		{
			label: "Most referenced",
			value: mostReferenced ? mostReferenced.name : "—",
		},
		{
			label: "Least referenced",
			value: leastReferenced ? leastReferenced.name : "—",
		},
		{ label: "Unused elements", value: stats.unusedCount },
	];

	const openUnusedElements = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
	};

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				How often each type and custom directive is referenced across the
				composed model. Types are counted wherever a field, argument, union
				member, or interface implementation points to them; directives are
				counted wherever they are applied. Enums are excluded here — they have
				their own Enum Usage card.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
					<li>
						A high count means the type or directive is a load-bearing part of
						the model that many other elements depend on.
					</li>
					<li>
						The least referenced element still earns its place, but a rarely
						referenced one may deserve review.
					</li>
					<li>
						Unused elements are declared but never referenced. Review them in
						the Quality tab.
					</li>
				</ul>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					For every field, argument, union member, and interface implementation,
					resolve the type it points to and count one reference against it. For
					every applied directive, count one application. Enums, built-in
					scalars, and root operation types are excluded, then results are
					sorted by count descending.
				</p>
			</section>

			<section className="flex flex-col gap-4">
				<Heading level="h3">Evidence</Heading>

				{topReferences.length > 0 && (
					<div className="flex flex-col gap-2">
						<Heading level="h4">By reference count</Heading>
						<ul className="flex flex-col gap-2">
							{topReferences.map((entry) => (
								<ReferenceCountRow key={entry.name} {...entry} />
							))}
						</ul>
						{stats.referencedCount > topReferences.length && (
							<ViewAllButton
								label={`View all ${stats.referencedCount}`}
								onClick={() =>
									dispatch(pushInsightDetail({ kind: "referencesList" }))
								}
							/>
						)}
					</div>
				)}

				<div className="flex flex-col gap-2">
					<Heading level="h4">Stats</Heading>
					<ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
						{statRows.map((stat) => (
							<li key={stat.label}>
								{stat.label}:{" "}
								<span className="font-semibold text-card-foreground">
									{stat.value}
								</span>
							</li>
						))}
					</ul>
				</div>

				{stats.unusedCount > 0 && (
					<button
						type="button"
						onClick={openUnusedElements}
						className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
					>
						View unused elements in Quality
						<ArrowRight className="h-4 w-4" />
					</button>
				)}
			</section>
		</div>
	);
}
