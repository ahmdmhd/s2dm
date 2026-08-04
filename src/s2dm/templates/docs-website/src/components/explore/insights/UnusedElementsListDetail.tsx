import type { QualityIssue } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { TypePathListRow } from "@/components/explore/insights/TypePathListRow";
import { useAppSelector } from "@/store/hooks";
import { selectUnusedElements } from "@/store/insights/insightsSelectors";

export function UnusedRow({ target }: QualityIssue) {
	return <TypePathListRow path={target} />;
}

export function UnusedElementsListDetail({ category }: { category: string }) {
	const unusedElements = useAppSelector(selectUnusedElements);
	const elements = unusedElements.filter(
		(element) => element.category === category,
	);

	return (
		<PagedList
			items={elements}
			getKey={(element) => `${element.category}:${element.target}`}
			renderItem={(element) => <UnusedRow {...element} />}
		/>
	);
}
