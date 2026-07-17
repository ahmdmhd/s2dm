const SPECTRUM_GRADIENT =
	"linear-gradient(to right, hsl(0, 80%, 45%) 0%, hsl(30, 80%, 45%) 25%, hsl(60, 80%, 45%) 50%, hsl(90, 80%, 45%) 75%, hsl(120, 80%, 45%) 100%)";

type DocumentationCoverageBarProps = {
	label: string;
	documented: number;
	total: number;
};

export function DocumentationCoverageBar({
	label,
	documented,
	total,
}: DocumentationCoverageBarProps) {
	const percent = total === 0 ? 0 : Math.round((documented / total) * 100);
	let fillBackgroundSize = "100% 100%";
	if (percent > 0) {
		fillBackgroundSize = `${(100 / percent) * 100}% 100%`;
	}

	return (
		<div className="flex items-center gap-3">
			<span className="w-32 shrink-0 text-sm text-muted-foreground">
				{label}
			</span>
			<div className="h-2 flex-1 rounded-full bg-muted">
				<div
					className="h-full rounded-full"
					style={{
						width: `${percent}%`,
						backgroundImage: SPECTRUM_GRADIENT,
						backgroundSize: fillBackgroundSize,
					}}
				/>
			</div>
			<span
				className="w-10 cursor-help text-right text-sm text-muted-foreground"
				title={`${documented}/${total} documented`}
			>
				{percent}%
			</span>
		</div>
	);
}
