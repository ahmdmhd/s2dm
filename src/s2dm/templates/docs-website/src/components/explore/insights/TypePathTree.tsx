type TypePathTreeProps = {
	segments: string[];
};

export function TypePathTree({ segments }: TypePathTreeProps) {
	return (
		<div className="flex flex-col gap-2 overflow-x-auto text-sm">
			{segments.map((segment, index) => (
				<div
					key={`${index}:${segment}`}
					className="flex w-max items-center gap-1 text-card-foreground"
					style={{ paddingLeft: `${index * 1.25}rem` }}
				>
					{index > 0 && (
						<span className="shrink-0 text-muted-foreground">└</span>
					)}
					<span className="whitespace-nowrap">{segment}</span>
				</div>
			))}
		</div>
	);
}
