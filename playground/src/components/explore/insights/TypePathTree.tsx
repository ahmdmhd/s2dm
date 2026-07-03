type TypePathTreeProps = {
	segments: string[];
};

export function TypePathTree({ segments }: TypePathTreeProps) {
	return (
		<div className="flex flex-col gap-2 text-sm">
			{segments.map((segment, index) => (
				<div
					key={segment}
					className="flex items-center gap-1 text-card-foreground"
					style={{ paddingLeft: `${index * 1.25}rem` }}
				>
					{index > 0 && <span className="text-muted-foreground">└</span>}
					<span>{segment}</span>
				</div>
			))}
		</div>
	);
}
