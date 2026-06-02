import { call, put, select, takeLatest } from "redux-saga/effects";
import {
	getDependenciesIdentities,
	saveDependenciesIdentities as saveDependenciesIdentitiesRequest,
} from "@/api/s2dm";
import type { DependenciesIdentities } from "@/api/types";
import {
	parseDependencyIdentity,
	serializeDependencyIdentityDraft,
} from "@/store/deps/identities/identitiesMappers";
import {
	fetchIdentities,
	fetchIdentitiesFailure,
	fetchIdentitiesSuccess,
	saveIdentities,
	saveIdentitiesFailure,
	saveIdentitiesSuccess,
	selectIdentityDrafts,
} from "@/store/deps/identities/identitiesSlice";
import type { RootState } from "@/store/types";
import { getErrorMessage } from "@/utils/getErrorMessage";

function* fetchIdentitiesWorker() {
	try {
		const identities: DependenciesIdentities = yield call(
			getDependenciesIdentities,
		);
		yield put(
			fetchIdentitiesSuccess(
				identities.identities.map(parseDependencyIdentity),
			),
		);
	} catch (error) {
		yield put(fetchIdentitiesFailure(getErrorMessage(error)));
	}
}

function* saveIdentitiesWorker() {
	try {
		const identities: ReturnType<typeof selectIdentityDrafts> = yield select(
			(state: RootState) => selectIdentityDrafts(state),
		);
		const payload: DependenciesIdentities = {
			identities: identities.map(serializeDependencyIdentityDraft),
		};

		yield call(saveDependenciesIdentitiesRequest, payload);
		yield put(saveIdentitiesSuccess());
	} catch (error) {
		yield put(saveIdentitiesFailure(getErrorMessage(error)));
	}
}

export function* depsIdentitiesSaga() {
	yield takeLatest(fetchIdentities.type, fetchIdentitiesWorker);
	yield takeLatest(saveIdentities.type, saveIdentitiesWorker);
}
