import { CategoryLabelRow } from "@insights-ui/components/CategoryLabelRow";
import {
	CategoryTick,
	LABEL_LEFT_PADDING,
} from "@insights-ui/components/CategoryTick";
import { useCategoryAxisWidth } from "@insights-ui/hooks/useCategoryAxisWidth";
import { type ReactNode, useRef } from "react";
import {
	Bar,
	BarChart,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

const LABEL_RIGHT_GUTTER = 8;

type ChartDatum = Record<string, boolean | number | string>;

type HorizontalMetricBarChartProps = {
	data: ChartDatum[];
	categoryKey: string;
	valueKey: string;
	maxValue: number;
	height?: number | string;
	formatCategory?: (value: string | number) => string;
	renderCategoryBadge?: (value: string | number) => ReactNode;
	reversed?: boolean;
};

function toCategoryValue(
	datum: ChartDatum,
	categoryKey: string,
): string | number {
	const value = datum[categoryKey];
	if (typeof value === "boolean") {
		return String(value);
	}
	return value;
}

export function HorizontalMetricBarChart({
	data,
	categoryKey,
	valueKey,
	maxValue,
	height = 176,
	formatCategory,
	renderCategoryBadge,
	reversed = false,
}: HorizontalMetricBarChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const labelProbeRef = useRef<HTMLDivElement>(null);
	const reservedWidth = LABEL_LEFT_PADDING + LABEL_RIGHT_GUTTER;
	const axisWidth = useCategoryAxisWidth(
		containerRef,
		labelProbeRef,
		reservedWidth,
	);
	const categoryValues = data.map((datum) =>
		toCategoryValue(datum, categoryKey),
	);

	return (
		<div ref={containerRef} className="relative w-full" style={{ height }}>
			<div
				ref={labelProbeRef}
				aria-hidden
				className="invisible absolute top-0 left-0 flex w-max flex-col"
			>
				{categoryValues.map((value) => (
					<CategoryLabelRow
						key={String(value)}
						value={value}
						format={formatCategory}
						renderBadge={renderCategoryBadge}
					/>
				))}
			</div>
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
						tick={
							<CategoryTick
								width={axisWidth}
								format={formatCategory}
								renderBadge={renderCategoryBadge}
							/>
						}
					/>
					<Bar
						dataKey={valueKey}
						fill="var(--color-blue-500)"
						radius={8}
						barSize={16}
						isAnimationActive={false}
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
