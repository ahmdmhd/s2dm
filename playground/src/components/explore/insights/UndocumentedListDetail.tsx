import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";
import {
	UNDOCUMENTED_ELEMENTS,
	type UndocumentedElement,
} from "@/components/explore/insights/undocumentedData";

export function UndocumentedRow({ name, kind }: UndocumentedElement) {
	return (
		<li className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
			<TypePathBreadcrumb segments={name.split(".")} maxSegments={5} />
			<span className="shrink-0 text-xs text-muted-foreground">{kind}</span>
		</li>
	);
}

export function UndocumentedListDetail() {
	return (
		<ul className="flex flex-col gap-2">
			{UNDOCUMENTED_ELEMENTS.map((element) => (
				<UndocumentedRow key={`${element.kind}:${element.name}`} {...element} />
			))}
		</ul>
	);
}
