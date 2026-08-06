import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathListRow } from "@insights-ui/components/TypePathListRow";
import { selectUnusedElements } from "@insights-ui/selectors/quality";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { QualityIssue } from "@insights-ui/types/quality";

export function UnusedRow({ target }: QualityIssue) {
	return <TypePathListRow path={target} />;
}

export function UnusedElementsListDetail({ category }: { category: string }) {
	const unusedElements = useInsightsSelector(selectUnusedElements);
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
