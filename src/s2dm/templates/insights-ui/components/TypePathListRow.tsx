import { EvidenceRow } from "@insights-ui/components/EvidenceRow";
import { TypePathBreadcrumb } from "@insights-ui/components/TypePathBreadcrumb";

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
