/**
 * Count how many items share the leading value.
 *
 * @param items - Items sorted so the top value comes first.
 * @param valueFor - Extracts the numeric value to compare from an item.
 * @returns The number of leading items tied at the top value, or 0 when empty.
 */
export function countTiedForTop<T>(
	items: readonly T[],
	valueFor: (item: T) => number,
): number {
	if (items.length === 0) {
		return 0;
	}
	const topValue = valueFor(items[0]);
	return items.filter((item) => valueFor(item) === topValue).length;
}
