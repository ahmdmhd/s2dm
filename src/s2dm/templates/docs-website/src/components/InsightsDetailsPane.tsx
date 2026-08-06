import { InsightLinkButton } from "@insights-ui/components/InsightLinkButton";
import { getInsightDetailView } from "@insights-ui/components/insightDetailView";
import {
	popInsightDetail,
	selectCanGoBackInsightDetail,
	selectInsightDetail,
} from "@insights-ui/state/insightDetailSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function InsightsDetailsPane() {
	const dispatch = useAppDispatch();
	const detail = useAppSelector(selectInsightDetail);
	const canGoBack = useAppSelector(selectCanGoBackInsightDetail);
	const detailView = detail ? getInsightDetailView(detail) : null;

	if (!detailView) {
		return (
			<div className="flex flex-1 items-center justify-center p-5 text-center text-muted-foreground">
				<p>Select a card to see details</p>
			</div>
		);
	}

	return (
		<section className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
			<div key={detailView.key} className="flex flex-col gap-4 px-5 pt-5 pb-8">
				{canGoBack && (
					<InsightLinkButton
						label="Back"
						direction="back"
						onClick={() => dispatch(popInsightDetail())}
					/>
				)}
				<span className="text-lg font-semibold text-card-foreground">
					Details
				</span>
				{detailView.content}
			</div>
		</section>
	);
}
