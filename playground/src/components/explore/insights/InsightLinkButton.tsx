import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

type InsightLinkButtonProps = {
	label: string;
	onClick?: () => void;
	className?: string;
};

export function InsightLinkButton({
	label,
	onClick,
	className,
}: InsightLinkButtonProps) {
	const disabled = !onClick;

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"inline-flex items-center gap-1 self-start text-sm font-medium",
				disabled
					? "cursor-not-allowed text-muted-foreground"
					: "cursor-pointer text-primary hover:underline",
				className,
			)}
		>
			{label}
			<ArrowRight className="h-4 w-4" />
		</button>
	);
}
