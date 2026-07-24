export function areDraftCollectionsEqual<Item>(
	left: Item[],
	right: Item[],
	areItemsEqual: (leftItem: Item, rightItem: Item) => boolean,
): boolean {
	if (left.length !== right.length) {
		return false;
	}

	return left.every((leftItem, index) => {
		const rightItem = right[index];
		return areItemsEqual(leftItem, rightItem);
	});
}
