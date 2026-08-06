import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";

export default function VoyagerPage() {
	const voyagerSrc = useBaseUrl("/voyager.html");
	return (
		<Layout title="Schema Visualizer" noFooter>
			<iframe
				src={voyagerSrc}
				style={{ width: "100%", height: "calc(100vh - 60px)", border: "none" }}
				title="GraphQL Voyager"
			/>
		</Layout>
	);
}
