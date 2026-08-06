export function groupBy<T, K>(
	items: readonly T[],
	keyFor: (item: T) => K,
): Map<K, T[]> {
	const groups = new Map<K, T[]>();
	for (const item of items) {
		const key = keyFor(item);
		const group = groups.get(key) ?? [];
		group.push(item);
		groups.set(key, group);
	}
	return groups;
}
