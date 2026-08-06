import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathListRow } from "@insights-ui/components/TypePathListRow";
import { selectUndocumentedElements } from "@insights-ui/selectors/coverage";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { UndocumentedEntity } from "@insights-ui/types/coverage";

export function UndocumentedRow({ name }: UndocumentedEntity) {
	return <TypePathListRow path={name} />;
}

export function UndocumentedListDetail({ entityKind }: { entityKind: string }) {
	const undocumentedElements = useInsightsSelector(selectUndocumentedElements);
	const elements = undocumentedElements.filter(
		(element) => element.kind === entityKind,
	);

	return (
		<PagedList
			items={elements}
			getKey={(element) => `${element.kind}:${element.name}`}
			renderItem={(element) => <UndocumentedRow {...element} />}
		/>
	);
}
