import { PagedList } from "@insights-ui/components/PagedList";
import { TypePathListRow } from "@insights-ui/components/TypePathListRow";
import { selectMissingUnits } from "@insights-ui/selectors/quality";
import { useInsightsSelector } from "@insights-ui/state/hooks";
import type { QualityIssue } from "@insights-ui/types/quality";

export function MissingUnitRow({ target }: QualityIssue) {
	return <TypePathListRow path={target} />;
}

export function MissingUnitsListDetail() {
	const missingUnits = useInsightsSelector(selectMissingUnits);

	return (
		<PagedList
			items={missingUnits}
			getKey={(element) => element.target}
			renderItem={(element) => <MissingUnitRow {...element} />}
		/>
	);
}
