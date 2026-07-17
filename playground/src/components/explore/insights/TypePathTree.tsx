type TypePathTreeProps = {
	segments: string[];
};

export function TypePathTree({ segments }: TypePathTreeProps) {
	return (
		<div className="flex flex-col gap-2 text-sm">
			{segments.map((segment, index) => (
				<div
					key={`${index}:${segment}`}
					className="flex min-w-0 items-center gap-1 text-card-foreground"
					style={{ paddingLeft: `${index * 1.25}rem` }}
				>
					{index > 0 && (
						<span className="shrink-0 text-muted-foreground">└</span>
					)}
					<span className="min-w-0 truncate" title={segment}>
						{segment}
					</span>
				</div>
			))}
		</div>
	);
}
