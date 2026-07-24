import type { UndocumentedEntity } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { TypePathListRow } from "@/components/explore/insights/TypePathListRow";
import { useAppSelector } from "@/store/hooks";
import { selectUndocumentedElements } from "@/store/insights/insightsSelectors";

export function UndocumentedRow({ name }: UndocumentedEntity) {
	return <TypePathListRow path={name} />;
}

export function UndocumentedListDetail({ entityKind }: { entityKind: string }) {
	const undocumentedElements = useAppSelector(selectUndocumentedElements);
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
