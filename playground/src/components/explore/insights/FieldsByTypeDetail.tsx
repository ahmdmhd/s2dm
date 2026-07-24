import type { ReactNode } from "react";
import { ContainerTypeRow } from "@/components/explore/insights/FieldsByTypeListDetail";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
import { Heading } from "@/components/ui/heading";
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

	const typeCount = stats?.typeCount ?? 0;
	const topTypes = containerTypeFieldCounts.slice(0, 5);
	const statRows = [
		{
			label: "Average fields per container type",
			value: (stats?.average ?? 0).toFixed(1),
		},
		{ label: "Median fields per container type", value: stats?.median ?? 0 },
		{ label: "Maximum fields on one container type", value: stats?.max ?? 0 },
		{ label: "Minimum fields on one container type", value: stats?.min ?? 0 },
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
			</section>

			<section className="flex flex-col gap-4">
				<Heading level="h3">Evidence</Heading>

				<div className="flex flex-col gap-2">
					{topTypes.length > 0 ? (
						<>
							<ul className="flex flex-col gap-2">
								{topTypes.map((entry) => (
									<ContainerTypeRow key={entry.type} {...entry} />
								))}
							</ul>
							{typeCount > topTypes.length && (
								<InsightLinkButton
									label={`View all ${typeCount}`}
									className="mt-1"
									onClick={() =>
										dispatch(pushInsightDetail({ kind: "fieldsByTypeList" }))
									}
								/>
							)}
						</>
					) : (
						<p className="text-muted-foreground">
							No container types have fields.
						</p>
					)}
				</div>

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
				<InsightLinkButton label="Related actions" />
			</section>
		</div>
	);
}
