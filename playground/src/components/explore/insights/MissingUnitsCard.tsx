import { ArrowRight } from "lucide-react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { MissingUnitRow } from "@/components/explore/insights/MissingUnitsListDetail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectMissingUnits,
	selectMissingUnitsStats,
} from "@/store/insights/insightsSelectors";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const PREVIEW_COUNT = 5;

export function MissingUnitsCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const missingUnits = useAppSelector(selectMissingUnits);
	const stats = useAppSelector(selectMissingUnitsStats);
	const selected = detail?.kind === "missingUnits";

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
								scalar fields declare no unit
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
						<ul className="flex flex-col gap-2">
							{preview.map((element) => (
								<MissingUnitRow key={element.target} {...element} />
							))}
						</ul>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No missing units data available
				</p>
			)}
			<button
				type="button"
				onClick={() => dispatch(openInsightDetail({ kind: "missingUnits" }))}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
