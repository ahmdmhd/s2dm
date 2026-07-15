import { ArrowRight } from "lucide-react";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";
import { cn } from "@/utils/cn";

type BreakdownSegment = {
	label: string;
	value: number;
	colorClassName: string;
};

type BreakdownStat = {
	label: string;
	value: number;
};

type BreakdownGroup = {
	title: string;
	total: number;
	segments?: BreakdownSegment[];
	stats?: BreakdownStat[];
};

const ELEMENT_GROUPS: BreakdownGroup[] = [
	{
		title: "Field Container Types",
		total: 18,
		segments: [
			{ label: "Object Types", value: 16, colorClassName: "bg-sky-500" },
			{ label: "Interface Types", value: 0, colorClassName: "bg-purple-500" },
			{ label: "Input Types", value: 2, colorClassName: "bg-emerald-500" },
		],
	},
	{
		title: "Fields",
		total: 72,
		segments: [
			{ label: "Leaf fields", value: 55, colorClassName: "bg-sky-500" },
			{
				label: "Relationships fields",
				value: 17,
				colorClassName: "bg-purple-500",
			},
		],
	},
	{
		title: "Enums",
		total: 35,
		stats: [
			{ label: "Enum values", value: 84 },
			{ label: "Median values/enum", value: 2 },
		],
	},
];

const totalElements = ELEMENT_GROUPS.reduce(
	(sum, group) => sum + group.total,
	0,
);

let largestGroup = ELEMENT_GROUPS[0];
for (const group of ELEMENT_GROUPS) {
	if (group.total > largestGroup.total) {
		largestGroup = group;
	}
}

function MiniStackedBar({ segments }: { segments: BreakdownSegment[] }) {
	const total = segments.reduce((sum, segment) => sum + segment.value, 0);

	return (
		<div className="flex h-6 w-full overflow-hidden rounded-md">
			{segments.map((segment) => (
				<div
					key={segment.label}
					className={segment.colorClassName}
					style={{ width: `${(segment.value / total) * 100}%` }}
				/>
			))}
		</div>
	);
}

export function ConceptsBreakdown() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "conceptsBreakdown";

	return (
		<HighlightableCard selected={selected}>
			<span className="text-lg font-semibold text-card-foreground">
				Elements breakdown
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-sm text-card-foreground">
					The composed model has{" "}
					<span className="font-semibold">{totalElements}</span> elements
				</p>
				<p className="text-sm text-muted-foreground">
					<span className="font-semibold">{largestGroup.title}</span> are the most
					common, with <span className="font-semibold">{largestGroup.total}</span>
				</p>
			</div>
			<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
				{ELEMENT_GROUPS.map((group, index) => (
					<div
						key={group.title}
						className={cn(
							"flex flex-col gap-3",
							index > 0 && "md:border-l md:border-border md:pl-8",
						)}
					>
						<div>
							<div className="text-base font-semibold text-card-foreground">
								{group.title}
							</div>
							<div className="text-sm text-muted-foreground">
								Total:{" "}
								<span className="font-semibold text-card-foreground">
									{group.total}
								</span>
							</div>
						</div>
						{group.segments && <MiniStackedBar segments={group.segments} />}
						<ul className="flex flex-col gap-1 text-sm">
							{group.segments?.map((segment) => (
								<li key={segment.label} className="flex items-center gap-2">
									<span
										className={cn(
											"h-2.5 w-2.5 shrink-0 rounded-sm",
											segment.colorClassName,
										)}
									/>
									<span className="text-muted-foreground">
										{segment.label}:
									</span>
									<span className="font-semibold text-card-foreground">
										{segment.value}
									</span>
								</li>
							))}
							{group.stats?.map((stat) => (
								<li key={stat.label} className="flex items-center gap-2">
									<span className="text-muted-foreground">{stat.label}:</span>
									<span className="font-semibold text-card-foreground">
										{stat.value}
									</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<button
				type="button"
				onClick={() =>
					dispatch(openInsightDetail({ kind: "conceptsBreakdown" }))
				}
				className="inline-flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
			>
				View details
				<ArrowRight className="h-4 w-4" />
			</button>
		</HighlightableCard>
	);
}
