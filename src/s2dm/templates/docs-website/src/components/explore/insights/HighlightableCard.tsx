import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type HighlightableCardProps = {
	children: ReactNode;
	className?: string;
};

export function HighlightableCard({
	children,
	className,
}: HighlightableCardProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-4 rounded-lg border border-border bg-card p-5",
				className,
			)}
		>
			{children}
		</div>
	);
}
