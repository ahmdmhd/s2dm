import { ScalarUsageRow } from "@/components/explore/insights/ScalarDistributionListDetail";
import { ViewAllButton } from "@/components/explore/insights/ViewAllButton";
import { Heading } from "@/components/ui/heading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectScalarUsage,
	selectScalarUsageStats,
} from "@/store/insights/insightsSelectors";
import { pushInsightDetail } from "@/store/ui/uiSlice";

export function ScalarDistributionDetail() {
	const dispatch = useAppDispatch();
	const scalarUsage = useAppSelector(selectScalarUsage);
	const stats = useAppSelector(selectScalarUsageStats);

	if (!stats) {
		return null;
	}

	const topScalars = scalarUsage.slice(0, 5);
	const statRows = [
		{ label: "Distinct datatypes used", value: stats.scalarCount },
		{ label: "Total scalar field usages", value: stats.totalOccurrences },
		{ label: "Built-in scalars", value: stats.builtinCount },
		{ label: "Custom scalars", value: stats.customCount },
	];

	return (
		<div className="flex flex-col gap-6 text-sm text-card-foreground">
			<p className="text-muted-foreground">
				How often each datatype is used as a field's output type across the
				composed model, covering the built-in scalars and any custom-defined
				scalars.
			</p>

			<section className="flex flex-col gap-2">
				<Heading level="h3">Interpretation</Heading>
				<ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
					<li>
						A high usage count means many fields carry that datatype; it is a
						core building block of the model.
					</li>
					<li>
						Built-in scalars are the GraphQL primitives (String, Int, Float,
						Boolean, ID). Custom scalars are datatypes declared in the schema.
					</li>
					<li>
						A rarely used custom scalar may deserve review to confirm it earns
						its place in the model.
					</li>
				</ul>
			</section>

			<section className="flex flex-col gap-2">
				<Heading level="h3">How it is calculated</Heading>
				<p className="text-muted-foreground">
					For every field declared on a container type (object, interface,
					input), resolve its named output type. When that type is a scalar,
					count one usage against it, then sort by usage count descending.
				</p>
			</section>

			<section className="flex flex-col gap-4">
				<Heading level="h3">Evidence</Heading>

				<div className="flex flex-col gap-2">
					<Heading level="h4">Datatypes by usage</Heading>
					<ul className="flex flex-col gap-2">
						{topScalars.map((scalar) => (
							<ScalarUsageRow key={scalar.name} {...scalar} />
						))}
					</ul>
					{stats.scalarCount > topScalars.length && (
						<ViewAllButton
							label={`View all ${stats.scalarCount}`}
							onClick={() =>
								dispatch(pushInsightDetail({ kind: "scalarDistributionList" }))
							}
						/>
					)}
				</div>

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
			</section>
		</div>
	);
}
