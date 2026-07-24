import {
	Bar,
	BarChart,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { CategoryTick } from "@/components/explore/insights/CategoryTick";

type ChartDatum = Record<string, boolean | number | string>;

type HorizontalMetricBarChartProps = {
	data: ChartDatum[];
	categoryKey: string;
	valueKey: string;
	maxValue: number;
	axisWidth: number;
	height?: number | string;
	formatCategory?: (value: string | number) => string;
	reversed?: boolean;
};

export function HorizontalMetricBarChart({
	data,
	categoryKey,
	valueKey,
	maxValue,
	axisWidth,
	height = 176,
	formatCategory,
	reversed = false,
}: HorizontalMetricBarChartProps) {
	return (
		<div className="w-full" style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					layout="vertical"
					margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
				>
					<XAxis type="number" domain={[0, maxValue]} hide />
					<YAxis
						type="category"
						dataKey={categoryKey}
						width={axisWidth}
						reversed={reversed}
						axisLine={false}
						tickLine={false}
						tick={<CategoryTick width={axisWidth} format={formatCategory} />}
					/>
					<Bar
						dataKey={valueKey}
						fill="var(--color-blue-500)"
						radius={[0, 4, 4, 0]}
						barSize={16}
					>
						<LabelList
							dataKey={valueKey}
							position="right"
							fill="var(--color-card-foreground)"
							fontSize={12}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
