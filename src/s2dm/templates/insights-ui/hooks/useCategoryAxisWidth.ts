import { type RefObject, useEffect, useState } from "react";

/** The part of a card the labels may take, so the bars always keep the rest. */
const MAX_AXIS_WIDTH_RATIO = 0.45;

/**
 * Size the category axis gutter to the labels it has to hold.
 *
 * Both widths come from the live layout: the probe reports the room the label rows
 * need in the font and the padding they actually render with, and the container
 * reports the room the card offers. A single `ResizeObserver` watches both, so a card
 * that resizes, data that changes and a font that loads late all correct the gutter
 * without any fixed value to keep in step.
 *
 * @param containerRef - The element the chart fills. Its width bounds the gutter.
 * @param labelProbeRef - An invisible element that renders the label rows at their
 *   natural width. Its own width is the width of the widest row.
 * @param reservedWidth - Room to add beside the rows, for the padding of the gutter.
 * @returns The gutter width in pixels, and `0` before the first measurement.
 */
export function useCategoryAxisWidth(
	containerRef: RefObject<HTMLElement | null>,
	labelProbeRef: RefObject<HTMLElement | null>,
	reservedWidth: number,
): number {
	const [containerWidth, setContainerWidth] = useState(0);
	const [widestLabelWidth, setWidestLabelWidth] = useState(0);

	useEffect(() => {
		const container = containerRef.current;
		const labelProbe = labelProbeRef.current;
		if (!container || !labelProbe) {
			return;
		}

		const observer = new ResizeObserver(() => {
			const containerBox = container.getBoundingClientRect();
			const labelProbeBox = labelProbe.getBoundingClientRect();
			setContainerWidth(containerBox.width);
			setWidestLabelWidth(labelProbeBox.width);
		});
		observer.observe(container);
		observer.observe(labelProbe);

		return () => observer.disconnect();
	}, [containerRef, labelProbeRef]);

	const maxWidth = containerWidth * MAX_AXIS_WIDTH_RATIO;
	const requiredWidth = widestLabelWidth + reservedWidth;
	return Math.ceil(Math.min(maxWidth, requiredWidth));
}
