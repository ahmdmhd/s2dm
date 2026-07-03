import { cn } from "@/utils/cn";

export type SeverityTone = "warning" | "info";

export const SEVERITY_TONE_CLASSES: Record<SeverityTone, string> = {
	warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

type SeverityBadgeProps = {
	label: string;
	value: number | string;
	tone: SeverityTone;
};

export function SeverityBadge({ label, value, tone }: SeverityBadgeProps) {
	return (
		<div className="flex flex-col gap-2">
			<span
				className={cn(
					"self-start rounded-md px-3 py-1 text-sm font-medium",
					SEVERITY_TONE_CLASSES[tone],
				)}
			>
				{label}
			</span>
			<span className="text-2xl font-bold text-card-foreground">{value}</span>
		</div>
	);
}
