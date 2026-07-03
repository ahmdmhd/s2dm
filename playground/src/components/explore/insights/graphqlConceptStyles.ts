import {
	AtSign,
	Box,
	FormInput,
	GitMerge,
	Hash,
	List,
	ListChecks,
	type LucideIcon,
	Shapes,
} from "lucide-react";

export type GraphQLConcept =
	| "object"
	| "interface"
	| "enum"
	| "union"
	| "scalar"
	| "input"
	| "field"
	| "directive";

type ConceptStyle = {
	icon: LucideIcon;
	accentClassName: string;
};

export const GRAPHQL_CONCEPT_STYLES: Record<GraphQLConcept, ConceptStyle> = {
	object: {
		icon: Box,
		accentClassName: "bg-sky-700/20 text-sky-700 dark:text-sky-400",
	},
	interface: {
		icon: Shapes,
		accentClassName: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
	enum: {
		icon: ListChecks,
		accentClassName: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
	},
	union: {
		icon: GitMerge,
		accentClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	},
	scalar: {
		icon: Hash,
		accentClassName: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
	},
	input: {
		icon: FormInput,
		accentClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	},
	field: {
		icon: List,
		accentClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
	},
	directive: {
		icon: AtSign,
		accentClassName: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
	},
};
