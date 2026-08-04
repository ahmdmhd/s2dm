import { EvidenceRow } from "@/components/explore/insights/EvidenceRow";
import { TypePathBreadcrumb } from "@/components/explore/insights/TypePathBreadcrumb";

type TypePathListRowProps = {
	path: string;
};

export function TypePathListRow({ path }: TypePathListRowProps) {
	return (
		<li>
			<EvidenceRow className="flex items-center gap-3">
				<TypePathBreadcrumb segments={path.split(".")} maxSegments={5} />
			</EvidenceRow>
		</li>
	);
}
