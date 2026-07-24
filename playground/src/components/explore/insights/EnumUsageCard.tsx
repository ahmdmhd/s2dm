import pluralize from "pluralize";
import type { ReactNode } from "react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { HorizontalMetricBarChart } from "@/components/explore/insights/HorizontalMetricBarChart";
import { InsightLinkButton } from "@/components/explore/insights/InsightLinkButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectEnumUsage,
	selectEnumUsageStats,
} from "@/store/insights/insightsSelectors";
import {
	openInsightDetail,
	pushInsightDetail,
	selectInsightDetail,
	setInsightsSubTab,
} from "@/store/ui/uiSlice";
import { countTiedForTop } from "@/utils/countTiedForTop";

const ENUM_AXIS_WIDTH = 140;

export function EnumUsageCard() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const enumUsage = useAppSelector(selectEnumUsage);
	const stats = useAppSelector(selectEnumUsageStats);
	const selected = detail?.kind === "enumUsage";

	const hasData = !!stats;
	const mostUsed = stats?.mostUsed ?? null;
	const leastUsed = stats?.leastUsed ?? null;
	const unusedCount = stats?.unusedCount ?? 0;
	const topEnums = enumUsage.slice(0, 5);
	const showLeastUsed = stats && stats.usedCount > 1 && leastUsed !== null;
	const tiedForMost = countTiedForTop(enumUsage, (entry) => entry.count);

	const openUnusedEnums = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
		dispatch(
			pushInsightDetail({ kind: "unusedList", category: "Unused enums" }),
		);
	};

	let mostUsedSummary: ReactNode;
	if (!mostUsed) {
		mostUsedSummary = (
			<p className="text-sm text-card-foreground">No enums are used</p>
		);
	} else if (tiedForMost > 1) {
		mostUsedSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{tiedForMost}</span> enums are tied for
				most used, with <span className="font-semibold">{mostUsed.count}</span>{" "}
				{pluralize("usage", mostUsed.count)} each
			</p>
		);
	} else {
		mostUsedSummary = (
			<p className="text-sm text-card-foreground">
				<span className="font-semibold">{mostUsed.name}</span> is the most used
				enum: <span className="font-semibold">{mostUsed.count}</span>{" "}
				{pluralize("usage", mostUsed.count)}
			</p>
		);
	}

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Enum Usage
			</span>
			{hasData ? (
				<>
					<div className="flex flex-col gap-1">
						{mostUsedSummary}
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">{stats.usedCount}</span> used
							across{" "}
							<span className="font-semibold">{stats.totalOccurrences}</span>{" "}
							{pluralize("usage", stats.totalOccurrences)}
						</p>
					</div>
					{mostUsed && (
						<HorizontalMetricBarChart
							data={topEnums}
							categoryKey="name"
							valueKey="count"
							maxValue={mostUsed.count}
							axisWidth={ENUM_AXIS_WIDTH}
						/>
					)}
					<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
						{showLeastUsed && (
							<span>
								Least used:{" "}
								<span className="font-semibold text-card-foreground">
									{leastUsed.name}
								</span>{" "}
								({leastUsed.count})
							</span>
						)}
						<button
							type="button"
							onClick={openUnusedEnums}
							className="cursor-pointer hover:underline"
						>
							Unused:{" "}
							<span className="font-semibold text-card-foreground">
								{unusedCount}
							</span>
						</button>
					</div>
				</>
			) : (
				<p className="text-sm text-muted-foreground">No enum data available</p>
			)}
			<InsightLinkButton
				label="View details"
				onClick={() => dispatch(openInsightDetail({ kind: "enumUsage" }))}
			/>
		</HighlightableCard>
	);
}
