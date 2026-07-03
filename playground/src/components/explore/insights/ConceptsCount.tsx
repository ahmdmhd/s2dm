import { ArrowRight } from "lucide-react";
import {
	GRAPHQL_CONCEPT_STYLES,
	type GraphQLConcept,
} from "@/components/explore/insights/graphqlConceptStyles";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";
import { cn } from "@/utils/cn";

type ConceptsCountProps = {
	label: string;
	value: number | string;
	concept: GraphQLConcept;
};

export function ConceptsCount({ label, value, concept }: ConceptsCountProps) {
	const { icon: Icon, accentClassName } = GRAPHQL_CONCEPT_STYLES[concept];
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected =
		detail?.kind === "conceptDetails" && detail.concept === concept;

	return (
		<HighlightableCard selected={selected}>
			<span className="text-sm text-muted-foreground">{label}</span>
			<div className="flex items-center justify-between">
				<span className="text-3xl font-bold text-card-foreground">{value}</span>
				<span
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-lg",
						accentClassName,
					)}
				>
					<Icon className="h-5 w-5" />
				</span>
			</div>
			<button
				type="button"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "conceptDetails", concept }))
				}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
