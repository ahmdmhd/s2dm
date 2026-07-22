import {
	MissingUnitRow,
	MissingUnitsListDetail,
} from "@/components/explore/insights/MissingUnitsListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { Heading } from "@/components/ui/heading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectMissingUnits,
	selectMissingUnitsStats,
} from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

const PREVIEW_COUNT = 5;

export function MissingUnitsDetail() {
	const dispatch = useAppDispatch();
	const missingUnits = useAppSelector(selectMissingUnits);
	const stats = useAppSelector(selectMissingUnitsStats);

	if (!stats) {
		return null;
	}

	const preview = missingUnits.slice(0, PREVIEW_COUNT);

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				Scalar-typed fields that do not declare a <code>unit</code> argument. A
				field measuring a physical quantity usually names its unit, so a missing
				one is worth a glance.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<p className="text-muted-foreground">
					This is a sanity check, not a modeling requirement. Many scalar fields
					legitimately have no unit — counts, ratios, and identifiers among them
					— so a flagged field is a prompt to confirm, not an error to fix.
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					Every field whose output type is a scalar is a candidate, including
					custom scalars. Fields typed by String, ID, or Boolean carry no
					measurable quantity and are skipped. A candidate passes when it
					declares a <code>unit</code> argument; otherwise it is listed here.
				</p>
			</section>

			<section className="flex flex-col gap-4">
				<Heading level="h3">Evidence</Heading>
				{preview.length > 0 ? (
					<div className="flex flex-col gap-2">
						<Heading level="h4">Fields without a unit</Heading>
						<ul className="flex flex-col gap-2">
							{preview.map((element) => (
								<MissingUnitRow key={element.target} {...element} />
							))}
						</ul>
						{stats.count > preview.length && (
							<ViewAllButton
								label={`View all ${stats.count}`}
								onClick={() =>
									dispatch(pushInsightDetail({ kind: "missingUnitsList" }))
								}
							/>
						)}
					</div>
				) : (
					<p className="text-muted-foreground">
						Every measurable field declares a unit.
					</p>
				)}
			</section>
		</div>
	);
}
