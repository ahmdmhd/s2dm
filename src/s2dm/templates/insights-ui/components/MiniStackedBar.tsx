import type { BreakdownSegment } from "@insights-ui/selectors/concepts";

export function MiniStackedBar({ segments }: { segments: BreakdownSegment[] }) {
	const total = segments.reduce((sum, segment) => sum + segment.value, 0);

	return (
		<div className="flex h-4 w-full overflow-hidden rounded-md bg-muted">
			{segments.map((segment) => (
				<div
					key={segment.label}
					className={segment.colorClassName}
					style={{
						width: total === 0 ? "0%" : `${(segment.value / total) * 100}%`,
					}}
				/>
			))}
		</div>
	);
}
