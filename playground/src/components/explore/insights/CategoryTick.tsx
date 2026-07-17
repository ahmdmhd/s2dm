const APPROX_CHAR_WIDTH = 6.5;
const LABEL_LEFT_PADDING = 4;

function truncateToWidth(label: string, width: number): string {
	const maxChars = Math.floor(width / APPROX_CHAR_WIDTH);
	if (label.length <= maxChars) {
		return label;
	}
	return `${label.slice(0, Math.max(1, maxChars - 1))}…`;
}

type CategoryTickProps = {
	y?: number;
	payload?: { value: string | number };
	width: number;
	format?: (value: string | number) => string;
};

// Left-aligns category labels at the gutter's left edge. Recharts anchors
// left-axis ticks to "end" by default, which leaves labels ragged on the left.
export function CategoryTick({
	y = 0,
	payload,
	width,
	format,
}: CategoryTickProps) {
	const value = payload?.value ?? "";
	const label = format ? format(value) : String(value);

	return (
		<text
			x={LABEL_LEFT_PADDING}
			y={y}
			dy={4}
			textAnchor="start"
			fontSize={12}
			fill="var(--color-muted-foreground)"
		>
			{truncateToWidth(label, width - LABEL_LEFT_PADDING)}
		</text>
	);
}
