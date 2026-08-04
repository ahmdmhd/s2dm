import type { ReactNode } from "react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { HorizontalMetricBarChart } from "@/components/explore/insights/HorizontalMetricBarChart";
import { useAppSelector } from "@/store/hooks";
import {
	selectContainerTypeFieldCounts,
	selectContainerTypeFieldStats,
} from "@/store/insights/insightsSelectors";
import { countTiedForTop } from "@/utils/countTiedForTop";

const TYPE_AXIS_WIDTH = 140;

export function FieldsByTypeChart() {
	const containerTypeFieldCounts = useAppSelector(
		selectContainerTypeFieldCounts,
	);
	const stats = useAppSelector(selectContainerTypeFieldStats);

	const largestType = containerTypeFieldCounts[0];
	const hasData = largestType && stats;

	const topContainerTypes = containerTypeFieldCounts.slice(0, 5);
	const secondLargestType = containerTypeFieldCounts[1];
	const tiedForMost = countTiedForTop(
		containerTypeFieldCounts,
		(entry) => entry.fieldCount,
	);
	let timesMoreLabel: string | null = null;
	if (secondLargestType && largestType) {
		const timesMore = largestType.fieldCount / secondLargestType.fieldCount;
		timesMoreLabel =
			timesMore % 1 === 0 ? `${timesMore}` : timesMore.toFixed(1);
	}

	let largestTypeSummary: ReactNode = null;
	if (largestType && tiedForMost > 1) {
		largestTypeSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{tiedForMost}</span> types are tied for
				most fields, with{" "}
				<span className="font-semibold">{largestType.fieldCount}</span> each
			</p>
		);
	} else if (largestType) {
		largestTypeSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{largestType.type}</span> has the most
				fields: <span className="font-semibold">{largestType.fieldCount}</span>
			</p>
		);
	}

	return (
		<HighlightableCard>
			<span className="text-lg font-semibold text-card-foreground">
				Largest Container Types by Fields
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						{largestTypeSummary}
						{secondLargestType && tiedForMost === 1 && (
							<p className="text-sm text-muted-foreground">
								<span className="font-semibold">{timesMoreLabel}×</span> more
								than {secondLargestType.type}, the second largest type
							</p>
						)}
					</div>
					<HorizontalMetricBarChart
						data={topContainerTypes}
						categoryKey="type"
						valueKey="fieldCount"
						maxValue={largestType.fieldCount}
						axisWidth={TYPE_AXIS_WIDTH}
					/>
					<div className="flex gap-6 text-sm text-muted-foreground">
						<span>
							Average fields per type:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.average.toFixed(1)}
							</span>
						</span>
						<span>
							Median fields per type:{" "}
							<span className="font-semibold text-card-foreground">
								{stats.median}
							</span>
						</span>
					</div>
				</>
			) : (
				<p className="text-sm text-muted-foreground">No field data available</p>
			)}
		</HighlightableCard>
	);
}
