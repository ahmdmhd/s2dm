import type { QualityIssue } from "@/api/types";
import { PagedList } from "@/components/explore/insights/PagedList";
import { TypePathListRow } from "@/components/explore/insights/TypePathListRow";
import { useAppSelector } from "@/store/hooks";
import { selectMissingUnits } from "@/store/insights/insightsSelectors";

export function MissingUnitRow({ target }: QualityIssue) {
	return <TypePathListRow path={target} />;
}

export function MissingUnitsListDetail() {
	const missingUnits = useAppSelector(selectMissingUnits);

	return (
		<PagedList
			items={missingUnits}
			getKey={(element) => element.target}
			renderItem={(element) => <MissingUnitRow {...element} />}
		/>
	);
}
