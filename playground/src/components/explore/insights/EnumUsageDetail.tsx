import { ArrowRight } from "lucide-react";
import { EnumUsageRow } from "@/components/explore/insights/EnumUsageListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { Heading } from "@/components/ui/heading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectEnumUsage,
	selectEnumUsageStats,
} from "@/store/insights/insightsSelectors";
import {
	openInsightDetail,
	pushInsightDetail,
	setInsightsSubTab,
} from "@/store/ui/uiSlice";

export function EnumUsageDetail() {
	const dispatch = useAppDispatch();
	const enumUsage = useAppSelector(selectEnumUsage);
	const stats = useAppSelector(selectEnumUsageStats);

	if (!stats) {
		return null;
	}

	const { mostUsed, leastUsed } = stats;
	const topEnums = enumUsage.slice(0, 5);
	const statRows = [
		{ label: "Enums used as field types", value: stats.usedCount },
		{ label: "Total enum field usages", value: stats.totalOccurrences },
		{ label: "Most used", value: mostUsed ? mostUsed.name : "—" },
		{ label: "Least used", value: leastUsed ? leastUsed.name : "—" },
		{ label: "Unused enums", value: stats.unusedCount },
	];

	const openUnusedEnums = () => {
		dispatch(setInsightsSubTab("quality"));
		dispatch(openInsightDetail({ kind: "unused" }));
		dispatch(
			pushInsightDetail({ kind: "unusedList", category: "Unused enums" }),
		);
	};

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				How often each enum is used as a field's output type across the composed
				model. Enums never used as a field type are surfaced separately as
				unused elements.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
					<li>
						A high usage count means many fields carry that enum; it is a core
						vocabulary of the model.
					</li>
					<li>
						The least used enum still earns its place, but a rarely used enum
						may deserve review.
					</li>
					<li>
						Unused enums are declared but never referenced by any field or
						argument. Review them in the Quality tab.
					</li>
				</ul>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					For every field declared on a container type (object, interface,
					input), resolve its named output type. When that type is an enum,
					count one usage against it, then sort by usage count descending.
				</p>
			</section>

			<section className="flex flex-col gap-4">
				<Heading level="h3">Evidence</Heading>

				{topEnums.length > 0 && (
					<div className="flex flex-col gap-2">
						<Heading level="h4">Enums by usage</Heading>
						<ul className="flex flex-col gap-2">
							{topEnums.map((entry) => (
								<EnumUsageRow key={entry.name} {...entry} />
							))}
						</ul>
						{stats.usedCount > topEnums.length && (
							<ViewAllButton
								label={`View all ${stats.usedCount}`}
								onClick={() =>
									dispatch(pushInsightDetail({ kind: "enumUsageList" }))
								}
							/>
						)}
					</div>
				)}

				<div className="flex flex-col gap-2">
					<Heading level="h4">Stats</Heading>
					<ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
						{statRows.map((stat) => (
							<li key={stat.label}>
								{stat.label}:{" "}
								<span className="font-semibold text-card-foreground">
									{stat.value}
								</span>
							</li>
						))}
					</ul>
				</div>

				{stats.unusedCount > 0 && (
					<button
						type="button"
						onClick={openUnusedEnums}
						className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
					>
						View unused enums in Quality
						<ArrowRight className="h-4 w-4" />
					</button>
				)}
			</section>
		</div>
	);
}
