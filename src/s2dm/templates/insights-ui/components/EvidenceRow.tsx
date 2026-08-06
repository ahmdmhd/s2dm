import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

const evidenceRow = cva("rounded-md", {
	variants: {
		look: {
			filled: "bg-muted",
			outlined: "border border-border",
		},
		padded: {
			true: "px-3 py-2",
			false: "",
		},
	},
});

type EvidenceRowProps = {
	children: ReactNode;
	/** Set to false when an inner element owns the padding, e.g. a full-row button. */
	padded?: boolean;
	className?: string;
};

export function EvidenceRow({
	children,
	padded = true,
	className,
}: EvidenceRowProps) {
	const { evidenceRowLook } = useInsightsHostDefaults();

	return (
		<div
			className={cn(evidenceRow({ look: evidenceRowLook, padded }), className)}
		>
			{children}
		</div>
	);
}
