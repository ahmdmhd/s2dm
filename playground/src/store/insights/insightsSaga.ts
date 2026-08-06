import {
	fetchInsights,
	fetchInsightsFailure,
	fetchInsightsSuccess,
} from "@insights-ui/state/insightsSlice";
import type { ConceptsResponse } from "@insights-ui/types/concepts";
import type { CoverageResponse } from "@insights-ui/types/coverage";
import type { QualityResponse } from "@insights-ui/types/quality";
import type { RelationshipsResponse } from "@insights-ui/types/relationships";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import {
	getSchemaConcepts,
	getSchemaCoverage,
	getSchemaQualityIssues,
	getSchemaRelationships,
} from "@/api/s2dm";
import type { SchemaInput } from "@/api/types";
import { selectFilteredSchema } from "@/store/schema/schemaSlice";
import { getErrorMessage } from "@/utils/getErrorMessage";

function* fetchInsightsWorker() {
	try {
		const filteredSchema: string = yield select(selectFilteredSchema);
		const schemas: SchemaInput[] = [
			{ type: "content", content: filteredSchema },
		];

		const [concepts, relationships, coverage, quality]: [
			ConceptsResponse,
			RelationshipsResponse,
			CoverageResponse,
			QualityResponse,
		] = yield all([
			call(getSchemaConcepts, schemas),
			call(getSchemaRelationships, schemas),
			call(getSchemaCoverage, schemas),
			call(getSchemaQualityIssues, schemas),
		]);

		yield put(
			fetchInsightsSuccess({ concepts, relationships, coverage, quality }),
		);
	} catch (error) {
		yield put(fetchInsightsFailure(getErrorMessage(error)));
	}
}

export function* insightsSaga() {
	yield takeLatest(fetchInsights.type, fetchInsightsWorker);
}
