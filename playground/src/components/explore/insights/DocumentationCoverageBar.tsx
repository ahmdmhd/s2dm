type DocumentationCoverageBarProps = {
	label: string;
	percent: number;
};

export function DocumentationCoverageBar({
	label,
	percent,
}: DocumentationCoverageBarProps) {
	return (
		<div className="flex items-center gap-3">
			<span className="w-24 text-sm text-muted-foreground">{label}</span>
			<div className="h-2 flex-1 rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-green-500"
					style={{ width: `${percent}%` }}
				/>
			</div>
			<span className="w-10 text-right text-sm text-muted-foreground">
				{percent}%
			</span>
		</div>
	);
}
