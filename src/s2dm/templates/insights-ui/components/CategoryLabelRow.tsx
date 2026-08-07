import type { ReactNode } from "react";

type CategoryLabelRowProps = {
	value: string | number;
	format?: (value: string | number) => string;
	renderBadge?: (value: string | number) => ReactNode;
	truncate?: boolean;
};

/**
 * Render one category label together with its optional badge.
 *
 * `HorizontalMetricBarChart` renders this row twice: once inside the axis, where the
 * gutter can be narrower than the text, and once inside an invisible probe that
 * reports the width the text needs. Both go through this component, so the width that
 * is measured is the width that is rendered.
 *
 * @param value - The raw category value taken from the chart data.
 * @param format - Formats the raw value into its display text.
 * @param renderBadge - Renders a badge after the label, such as a scalar's
 *   built-in/custom marker. The label absorbs any truncation, never the badge.
 * @param truncate - Cuts the label at the width of the row. Leave it off to let the
 *   row take the width that the text needs.
 * @returns The label row.
 */
export function CategoryLabelRow({
	value,
	format,
	renderBadge,
	truncate = false,
}: CategoryLabelRowProps) {
	let label = String(value);
	if (format) {
		label = format(value);
	}

	let badge: ReactNode = null;
	if (renderBadge) {
		badge = renderBadge(value);
	}

	let rowClassName = "flex h-full items-center gap-1.5";
	let labelClassName = "text-xs text-muted-foreground";
	if (truncate) {
		rowClassName += " overflow-hidden";
		labelClassName += " min-w-0 truncate";
	}

	return (
		<div className={rowClassName}>
			<span className={labelClassName}>{label}</span>
			{badge}
		</div>
	);
}
