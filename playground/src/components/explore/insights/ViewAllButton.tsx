import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

type ViewAllButtonProps = {
	label: string;
	onClick?: () => void;
};

export function ViewAllButton({ label, onClick }: ViewAllButtonProps) {
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
