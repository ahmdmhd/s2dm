import { EvidenceRow } from "@/components/explore/insights/EvidenceRow";
import { CONTAINER_KIND_DOT_CLASSES } from "@/components/explore/insights/FieldsByKindDetail";
import { PagedList } from "@/components/explore/insights/PagedList";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { useAppSelector } from "@/store/hooks";
import {
	type ContainerTypeFieldCount,
	selectContainerTypeFieldCounts,
} from "@/store/insights/insightsSelectors";
import { cn } from "@/utils/cn";

export function ContainerTypeRow({
	type,
	fieldCount,
	kind,
}: ContainerTypeFieldCount) {
	return (
		<li>
			<EvidenceRow className="flex items-center justify-between gap-3 text-sm">
				<div className="flex min-w-0 items-center gap-2">
					<TypePathBreadcrumb segments={[type]} />
					<span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
						<span
							className={cn(
								"h-2 w-2 rounded-sm",
								CONTAINER_KIND_DOT_CLASSES[kind],
							)}
						/>
						{kind}
					</span>
				</div>
				<span className="shrink-0">
					<span className="font-bold text-card-foreground">{fieldCount}</span>{" "}
					<span className="text-muted-foreground">fields</span>
				</span>
			</EvidenceRow>
		</li>
	);
}

export function FieldsByTypeListDetail() {
	const containerTypeFieldCounts = useAppSelector(
		selectContainerTypeFieldCounts,
	);

	return (
		<PagedList
			items={containerTypeFieldCounts}
			getKey={(entry) => entry.type}
			renderItem={(entry) => <ContainerTypeRow {...entry} />}
		/>
	);
}
