import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

type TypePathListRowProps = {
	path: string;
};

export function TypePathListRow({ path }: TypePathListRowProps) {
	return (
		<li className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
			<TypePathBreadcrumb segments={path.split(".")} maxSegments={5} />
		</li>
	);
}
