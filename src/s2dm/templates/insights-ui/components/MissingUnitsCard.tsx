import { EvidenceList } from "@insights-ui/components/EvidenceList";
import { HighlightableCard } from "@insights-ui/components/HighlightableCard";
import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { MissingUnitRow } from "@insights-ui/components/MissingUnitsListDetail";
import { useInsightsHostDefaults } from "@insights-ui/hostDefaults";
import {
	selectMissingUnits,
	selectMissingUnitsStats,
} from "@insights-ui/selectors/quality";
import {
	useInsightsDispatch,
	useInsightsSelector,
} from "@insights-ui/state/hooks";
import {
	openInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import pluralize from "pluralize";

const PREVIEW_COUNT = 5;

export function MissingUnitsCard() {
	const { selectableCards } = useInsightsHostDefaults();
	const dispatch = useInsightsDispatch();
	const detail = useInsightsSelector(selectInsightDetail);
	const missingUnits = useInsightsSelector(selectMissingUnits);
	const stats = useInsightsSelector(selectMissingUnitsStats);
	const selected = selectableCards && detail?.kind === "missingUnits";

	const hasData = !!stats;
	const preview = missingUnits.slice(0, PREVIEW_COUNT);

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Missing Units
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						{stats.count > 0 ? (
							<p className="text-sm text-card-foreground">
								<span className="font-semibold">
									{stats.count.toLocaleString()}
								</span>{" "}
								scalar {pluralize("field", stats.count)}{" "}
								{stats.count === 1 ? "declares" : "declare"} no unit
							</p>
						) : (
							<p className="text-sm text-card-foreground">
								Every measurable field declares a unit
							</p>
						)}
						<p className="text-sm text-muted-foreground">
							Sanity check — units are recommended for measurable fields, not
							required.
						</p>
					</div>
					{preview.length > 0 && (
						<EvidenceList>
							{preview.map((element) => (
								<MissingUnitRow key={element.target} {...element} />
							))}
						</EvidenceList>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No missing units data available
				</p>
			)}
			{selectableCards && (
				<InsightLinkButton
					label="View details"
					onClick={() => dispatch(openInsightDetail({ kind: "missingUnits" }))}
				/>
			)}
		</HighlightableCard>
	);
}
