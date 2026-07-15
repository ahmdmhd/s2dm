import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { ENUMS, EnumRow } from "@/components/explore/insights/EnumsDetail";
import {
	FieldTypeRow,
	LEAF_FIELDS,
	RELATIONSHIP_FIELDS,
} from "@/components/explore/insights/FieldsByKindDetail";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Heading } from "@/components/ui/heading";
import { StatusBanner } from "@/components/ui/status-banner";
import { useAppDispatch } from "@/store/hooks";
import { pushInsightDetail } from "@/store/ui/uiSlice";
import { cn } from "@/utils/cn";

const OBJECT_SAMPLE = ["Vehicle", "Cabin", "Seat"];
const OBJECT_TOTAL = 16;
const INPUT_SAMPLE = ["InCabinArea2x2Input", "InCabinArea2x3Input"];
const INPUT_TOTAL = 2;
const LEAF_SAMPLE = LEAF_FIELDS.slice(0, 3);
const RELATIONSHIP_SAMPLE = RELATIONSHIP_FIELDS.slice(0, 3);
const ENUM_SAMPLE = [
	{ ...ENUMS[0], rank: "Largest" },
	{ ...ENUMS[Math.floor(ENUMS.length / 2)], rank: "Median" },
	{ ...ENUMS[ENUMS.length - 1], rank: "Smallest" },
];

function ViewAllButton({
	label,
	onClick,
}: {
	label: string;
	onClick?: () => void;
}) {
	const disabled = !onClick;

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"mt-1 inline-flex items-center gap-1 self-start text-sm font-medium",
				disabled
					? "cursor-not-allowed text-muted-foreground"
					: "cursor-pointer text-primary hover:underline",
			)}
		>
			{label}
			<ArrowRight className="h-4 w-4" />
		</button>
	);
}

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
								{OBJECT_SAMPLE.map((name) => (
									<TypePathBreadcrumb key={name} segments={[name]} />
								))}
							</div>
							{OBJECT_TOTAL > OBJECT_SAMPLE.length && (
								<ViewAllButton
									label={`View all ${OBJECT_TOTAL}`}
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
							<p className="text-muted-foreground">
								No interface types in this schema.
							</p>
						</EvidenceSubsection>

						<EvidenceSubsection title="Input types">
							<div className="flex flex-wrap gap-2">
								{INPUT_SAMPLE.map((name) => (
									<TypePathBreadcrumb key={name} segments={[name]} />
								))}
							</div>
							{INPUT_TOTAL > INPUT_SAMPLE.length && (
								<ViewAllButton
									label={`View all ${INPUT_TOTAL}`}
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
						</EvidenceSubsection>
					</div>
				</CollapsibleSection>

				<CollapsibleSection title="Fields" defaultCollapsed>
					<div className="flex flex-col gap-4 py-3">
						<EvidenceSubsection title="Leaf fields">
							<div className="flex flex-col gap-2">
								{LEAF_SAMPLE.map((entry) => (
									<FieldTypeRow key={entry.field} {...entry} />
								))}
							</div>
							{LEAF_FIELDS.length > LEAF_SAMPLE.length && (
								<ViewAllButton
									label={`View all ${LEAF_FIELDS.length}`}
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
								{RELATIONSHIP_SAMPLE.map((entry) => (
									<FieldTypeRow key={entry.field} {...entry} />
								))}
							</div>
							{RELATIONSHIP_FIELDS.length > RELATIONSHIP_SAMPLE.length && (
								<ViewAllButton
									label={`View all ${RELATIONSHIP_FIELDS.length}`}
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
						{ENUM_SAMPLE.map((entry) => (
							<EnumRow key={entry.name} {...entry} />
						))}
						<ViewAllButton
							label={`View all ${ENUMS.length}`}
							onClick={() => dispatch(pushInsightDetail({ kind: "enumsList" }))}
						/>
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
