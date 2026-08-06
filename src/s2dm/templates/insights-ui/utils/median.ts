/**
 * Compute the median of a list of numbers.
 *
 * @param values - The numbers to summarize, in any order.
 * @returns The middle value, the mean of the two middle values for an even-length
 *   list, or `0` when the list is empty.
 */
export function median(values: number[]): number {
	if (values.length === 0) {
		return 0;
	}
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[middle - 1] + sorted[middle]) / 2;
	}
	return sorted[middle];
}
