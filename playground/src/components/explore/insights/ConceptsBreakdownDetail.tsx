import type { ReactNode } from "react";
import { EnumRow } from "@/components/explore/insights/EnumsDetail";
import { FieldTypeRow } from "@/components/explore/insights/FieldsByKindDetail";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { StatusBanner } from "@/components/ui/status-banner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectConceptMembers,
	selectEnums,
	selectLeafFields,
	selectRelationshipFields,
} from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

const SAMPLE_SIZE = 3;

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

export function ConceptsBreakdownDetail() {
	const dispatch = useAppDispatch();
	const members = useAppSelector(selectConceptMembers);
	const leafFields = useAppSelector(selectLeafFields);
	const relationshipFields = useAppSelector(selectRelationshipFields);
	const enums = useAppSelector(selectEnums);

	if (!members) {
		return null;
	}

	const objectSample = members.object.slice(0, SAMPLE_SIZE);
	const interfaceSample = members.interface.slice(0, SAMPLE_SIZE);
	const inputSample = members.input.slice(0, SAMPLE_SIZE);
	const leafSample = leafFields.slice(0, SAMPLE_SIZE);
	const relationshipSample = relationshipFields.slice(0, SAMPLE_SIZE);
	let enumSample: { name: string; values: number; rank: string }[] = [];
	if (enums.length > 0) {
		enumSample = [
			{ ...enums[0], rank: "Largest" },
			{ ...enums[Math.floor(enums.length / 2)], rank: "Median" },
			{ ...enums[enums.length - 1], rank: "Smallest" },
		];
	}

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				Count of the number of elements found in the current composed model,
				separated as Field Container Types, Fields and Enums.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
					<li>
						<span className="font-medium text-card-foreground">
							Field Container Types
						</span>{" "}
						— structures that contain fields. Think of them as the entities,
						features of interest, or classes that belong to the domain.
					</li>
					<li>
						<span className="font-medium text-card-foreground">Fields</span> —
						properties specified inside container types. Think of them as the
						aspects that characterize the container types.
						<ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
							<li>
								<span className="font-medium text-card-foreground">
									Leaf fields
								</span>{" "}
								— fields whose output types are scalars (e.g. String, Boolean).
							</li>
							<li>
								<span className="font-medium text-card-foreground">
									Relationship fields
								</span>{" "}
								— fields whose output type is another type.
							</li>
							<li>
								<span className="font-medium text-card-foreground">
									Input fields
								</span>{" "}
								— fields declared on input object types.
							</li>
						</ul>
					</li>
					<li>
						<span className="font-medium text-card-foreground">Enums</span> —
						set of controlled terms.
					</li>
				</ul>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					Count GraphQL definitions and fields from the composed schema:
				</p>
				<ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
					<li>
						Field container types = object types + interface types + input
						object types
					</li>
					<li>
						Fields = fields declared on object types, interfaces, and input
						object types
					</li>
					<li>Enums = enum type definitions</li>
				</ul>
				<StatusBanner variant="info">
					<span className="font-medium">Note:</span> configured technical root
					types such as Query, Mutation, and Subscription may be excluded from
					domain-oriented counts.
				</StatusBanner>
			</section>

			<section className="flex flex-col gap-3">
				<Heading level="h3">Evidence</Heading>

				<CollapsibleSection title="Field Container Types" defaultCollapsed>
					<div className="flex flex-col gap-4 py-3">
						<EvidenceSubsection title="Object types">
							<div className="flex flex-wrap gap-2">
								{objectSample.map((name) => (
									<TypePathBreadcrumb
										key={name}
										segments={[name]}
										truncate={false}
									/>
								))}
							</div>
							{members.object.length > objectSample.length && (
								<ViewAllButton
									label={`View all ${members.object.length}`}
									onClick={() =>
										dispatch(
											pushInsightDetail({
												kind: "conceptDetails",
												concept: "object",
											}),
										)
									}
								/>
							)}
						</EvidenceSubsection>

						<EvidenceSubsection title="Interface types">
							{interfaceSample.length === 0 ? (
								<p className="text-muted-foreground">
									No interface types in this schema.
								</p>
							) : (
								<>
									<div className="flex flex-wrap gap-2">
										{interfaceSample.map((name) => (
											<TypePathBreadcrumb
												key={name}
												segments={[name]}
												truncate={false}
											/>
										))}
									</div>
									{members.interface.length > interfaceSample.length && (
										<ViewAllButton
											label={`View all ${members.interface.length}`}
											onClick={() =>
												dispatch(
													pushInsightDetail({
														kind: "conceptDetails",
														concept: "interface",
													}),
												)
											}
										/>
									)}
								</>
							)}
						</EvidenceSubsection>

						<EvidenceSubsection title="Input types">
							{inputSample.length === 0 ? (
								<p className="text-muted-foreground">
									No input types in this schema.
								</p>
							) : (
								<>
									<div className="flex flex-wrap gap-2">
										{inputSample.map((name) => (
											<TypePathBreadcrumb
												key={name}
												segments={[name]}
												truncate={false}
											/>
										))}
									</div>
									{members.input.length > inputSample.length && (
										<ViewAllButton
											label={`View all ${members.input.length}`}
											onClick={() =>
												dispatch(
													pushInsightDetail({
														kind: "conceptDetails",
														concept: "input",
													}),
												)
											}
										/>
									)}
								</>
							)}
						</EvidenceSubsection>
					</div>
				</CollapsibleSection>

				<CollapsibleSection title="Fields" defaultCollapsed>
					<div className="flex flex-col gap-4 py-3">
						<EvidenceSubsection title="Leaf fields">
							<div className="flex flex-col gap-2">
								{leafSample.map((entry) => (
									<FieldTypeRow key={entry.field} {...entry} />
								))}
							</div>
							{leafFields.length > leafSample.length && (
								<ViewAllButton
									label={`View all ${leafFields.length}`}
									onClick={() =>
										dispatch(
											pushInsightDetail({
												kind: "fieldsByKind",
												fieldKind: "leaf",
											}),
										)
									}
								/>
							)}
						</EvidenceSubsection>

						<EvidenceSubsection title="Relationship fields">
							<div className="flex flex-col gap-2">
								{relationshipSample.map((entry) => (
									<FieldTypeRow key={entry.field} {...entry} />
								))}
							</div>
							{relationshipFields.length > relationshipSample.length && (
								<ViewAllButton
									label={`View all ${relationshipFields.length}`}
									onClick={() =>
										dispatch(
											pushInsightDetail({
												kind: "fieldsByKind",
												fieldKind: "relationship",
											}),
										)
									}
								/>
							)}
						</EvidenceSubsection>
					</div>
				</CollapsibleSection>

				<CollapsibleSection title="Enums" defaultCollapsed>
					<div className="flex flex-col gap-2 py-3">
						{enumSample.map((entry) => (
							<EnumRow key={`${entry.name}:${entry.rank}`} {...entry} />
						))}
						{enums.length > 0 && (
							<ViewAllButton
								label={`View all ${enums.length}`}
								onClick={() =>
									dispatch(pushInsightDetail({ kind: "enumsList" }))
								}
							/>
						)}
					</div>
				</CollapsibleSection>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Actions</Heading>
				<ViewAllButton label="Related actions" />
			</section>
		</div>
	);
}
