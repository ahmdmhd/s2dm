import type { ReactNode } from "react";
import { ContainerTypeRow } from "@/components/explore/insights/FieldsByTypeListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { Heading } from "@/components/ui/heading";
import { StatusBanner } from "@/components/ui/status-banner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectContainerTypeFieldCounts,
	selectContainerTypeFieldStats,
} from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

function EvidenceSubsection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Heading level="h4">{title}</Heading>
			{children}
		</div>
	);
}

export function FieldsByTypeDetail() {
	const dispatch = useAppDispatch();
	const containerTypeFieldCounts = useAppSelector(
		selectContainerTypeFieldCounts,
	);
	const stats = useAppSelector(selectContainerTypeFieldStats);

	if (!stats) {
		return null;
	}

	const topTypes = containerTypeFieldCounts.slice(0, 5);
	const statRows = [
		{
			label: "Average fields per container type",
			value: stats.average.toFixed(1),
		},
		{ label: "Median fields per container type", value: stats.median },
		{ label: "Maximum fields on one container type", value: stats.max },
		{ label: "Minimum fields on one container type", value: stats.min },
	];

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				Ranking of container types by the number of directly declared fields in
				the current composed model.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
					<li>
						Large container types are the structures with the highest number of
						direct fields (i.e. properties).
					</li>
					<li>
						A high field count is not necessarily a problem; it may simply mean
						the type represents a rich domain concept.
					</li>
					<li>
						Very large types may deserve review if they become difficult to
						understand, maintain, document, or map to downstream formats.
					</li>
					<li>
						This insight only counts direct fields declared on the type. It does
						not count nested child fields reached through relationships.
					</li>
				</ul>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					Count the fields declared directly on each container type (object,
					interface, input) from the composed schema, then sort in descending
					order by field count.
				</p>
				<StatusBanner variant="info">
					<span className="font-medium">Note:</span> configured technical root
					types such as Query, Mutation, and Subscription may be excluded from
					domain-oriented counts.
				</StatusBanner>
			</section>

			<section className="flex flex-col gap-4">
				<Heading level="h3">Evidence</Heading>

				<EvidenceSubsection title="Largest container types">
					<ul className="flex flex-col gap-2">
						{topTypes.map((entry) => (
							<ContainerTypeRow key={entry.type} {...entry} />
						))}
					</ul>
					{stats.typeCount > topTypes.length && (
						<ViewAllButton
							label={`View all ${stats.typeCount}`}
							onClick={() =>
								dispatch(pushInsightDetail({ kind: "fieldsByTypeList" }))
							}
						/>
					)}
				</EvidenceSubsection>

				<EvidenceSubsection title="Stats">
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
				</EvidenceSubsection>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Actions</Heading>
				<ViewAllButton label="Related actions" />
			</section>
		</div>
	);
}
