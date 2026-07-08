import {
	CONTAINER_KIND_DOT_CLASSES,
	CONTAINER_TYPE_FIELD_COUNTS,
	type ContainerTypeFieldCount,
} from "@/components/explore/insights/FieldsByKindDetail";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import { cn } from "@/utils/cn";

export function ContainerTypeRow({
	type,
	fieldCount,
	kind,
}: ContainerTypeFieldCount) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
			<div className="flex items-center gap-2">
				<TypePathBreadcrumb segments={[type]} />
				<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span
						className={cn(
							"h-2 w-2 rounded-sm",
							CONTAINER_KIND_DOT_CLASSES[kind],
						)}
					/>
					{kind}
				</span>
			</div>
			<span>
				<span className="font-bold text-card-foreground">{fieldCount}</span>{" "}
				<span className="text-muted-foreground">fields</span>
			</span>
		</li>
	);
}

export function FieldsByTypeListDetail() {
	return (
		<ul className="flex flex-col gap-2">
			{CONTAINER_TYPE_FIELD_COUNTS.map((entry) => (
				<ContainerTypeRow key={entry.type} {...entry} />
			))}
		</ul>
	);
}
