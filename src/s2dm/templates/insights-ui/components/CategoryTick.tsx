import { CategoryLabelRow } from "@insights-ui/components/CategoryLabelRow";
import type { ReactNode } from "react";

export const LABEL_LEFT_PADDING = 4;
const ROW_HEIGHT = 24;

type CategoryTickProps = {
	y?: number;
	payload?: { value: string | number };
	width: number;
	format?: (value: string | number) => string;
	renderBadge?: (value: string | number) => ReactNode;
};

/**
 * Renders a category axis label as HTML inside a `foreignObject`, so the label can
 * host the same badge components the rest of the insights UI uses and can truncate
 * through CSS. Labels are left-aligned at the gutter's left edge; recharts anchors
 * left-axis ticks to "end" by default, which leaves them ragged on the left.
 *
 * @param y - Vertical center of the tick, as supplied by recharts. A `foreignObject`
 *   is positioned from its top edge, hence the half-row offset applied here.
 * @param payload - Recharts tick payload carrying the raw category value.
 * @param width - Width of the axis gutter available to the label.
 * @param format - Formats the raw category value into its display text.
 * @param renderBadge - Renders a badge placed after the label, such as a scalar's
 *   built-in/custom marker. The label absorbs any truncation, never the badge.
 * @returns The label element for one category axis tick.
 */
export function CategoryTick({
	y = 0,
	payload,
	width,
	format,
	renderBadge,
}: CategoryTickProps) {
	const value = payload?.value ?? "";

	return (
		<foreignObject
			x={LABEL_LEFT_PADDING}
			y={y - ROW_HEIGHT / 2}
			width={width - LABEL_LEFT_PADDING}
			height={ROW_HEIGHT}
		>
			<CategoryLabelRow
				value={value}
				format={format}
				renderBadge={renderBadge}
				truncate
			/>
		</foreignObject>
	);
}
