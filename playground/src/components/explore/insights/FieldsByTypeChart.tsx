import { ArrowRight } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { HighlightableCard } from "@/components/explore/insights/HighlightableCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openInsightDetail, selectInsightDetail } from "@/store/ui/uiSlice";

const fieldsByType: { type: string; fieldCount: number }[] = [
	{ type: "Seat", fieldCount: 24 },
	{ type: "Backrest", fieldCount: 12 },
	{ type: "Headrest", fieldCount: 6 },
	{ type: "Vehicle", fieldCount: 4 },
	{ type: "Seating", fieldCount: 3 },
	{ type: "ChargingSession", fieldCount: 3 },
	{ type: "Cabin", fieldCount: 2 },
	{ type: "InCabinArea2x2", fieldCount: 2 },
	{ type: "InCabinArea2x3", fieldCount: 2 },
	{ type: "ManySeatsInstanceTag", fieldCount: 2 },
];

export function FieldsByTypeChart() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const selected = detail?.kind === "fieldsByType";

	return (
		<HighlightableCard selected={selected}>
			<div className="flex items-center justify-between">
				<span className="text-lg font-semibold text-card-foreground">
					Top 10 Object Types by Number of Fields
				</span>
				<button
					type="button"
					onClick={() => dispatch(openInsightDetail({ kind: "fieldsByType" }))}
					className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
				>
					View all
					<ArrowRight className="h-4 w-4" />
				</button>
			</div>
			<div className="h-[380px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={fieldsByType}
						layout="vertical"
						margin={{ top: 8, right: 32, bottom: 24, left: 8 }}
					>
						<CartesianGrid horizontal={false} stroke="var(--color-border)" />
						<XAxis
							type="number"
							domain={[0, 25]}
							tickCount={6}
							allowDecimals={false}
							stroke="var(--color-border)"
							tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
							label={{
								value: "# Fields",
								position: "insideBottom",
								offset: -12,
								fill: "var(--color-muted-foreground)",
								fontSize: 12,
							}}
						/>
						<YAxis
							type="category"
							dataKey="type"
							width={150}
							stroke="var(--color-border)"
							tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
						/>
						<Bar
							dataKey="fieldCount"
							fill="var(--color-blue-500)"
							radius={[0, 4, 4, 0]}
						>
							<LabelList
								dataKey="fieldCount"
								position="right"
								fill="var(--color-card-foreground)"
								fontSize={12}
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</HighlightableCard>
	);
}
