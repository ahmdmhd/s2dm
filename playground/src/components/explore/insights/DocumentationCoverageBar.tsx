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

	return (
		<div className="flex items-center gap-3">
			<span className="w-32 shrink-0 text-sm text-muted-foreground">
				{label}
			</span>
			<div className="h-2 flex-1 rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-green-500"
					style={{ width: `${percent}%` }}
				/>
			</div>
			<span className="w-14 text-right text-sm text-muted-foreground">
				{documented}/{total}
			</span>
			<span className="w-10 text-right text-sm text-muted-foreground">
				{percent}%
			</span>
		</div>
	);
}
