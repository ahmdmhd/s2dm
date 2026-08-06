import type { PathSegment } from "@insights-ui/types/relationships";

/**
 * Render each reference-path segment as a display label.
 *
 * The root segment (no incoming field) renders as its bare type name; every
 * other segment renders as `field: fieldType`, e.g. `seats: [Seat!]!`, so the
 * field name and its list/nullability information are both visible.
 *
 * @param segments - The path segments, root first, as returned by the API.
 * @returns One label string per segment, in the same order.
 */
export function formatPathSegments(segments: PathSegment[]): string[] {
	return segments.map((segment) => {
		if (segment.field === null) {
			return segment.type;
		}
		return `${segment.field}: ${segment.field_type}`;
	});
}
