import { call, put, select, takeLatest } from "redux-saga/effects";
import {
	getDependenciesConfig,
	getDependenciesStatus,
	saveDependenciesConfig as saveDependenciesConfigRequest,
} from "@/api/s2dm";
import type {
	DependenciesConfig,
	DependenciesStatusResponse,
} from "@/api/types";
import {
	parseDependencyConfig,
	serializeDependencyDraft,
} from "@/store/deps/depsMappers";
import {
	fetchDependenciesConfig,
	fetchDependenciesConfigFailure,
	fetchDependenciesConfigSuccess,
	fetchDependenciesStatus,
	fetchDependenciesStatusFailure,
	fetchDependenciesStatusSuccess,
	saveDependenciesConfig,
	saveDependenciesConfigFailure,
	saveDependenciesConfigSuccess,
	selectDependencyDrafts,
} from "@/store/deps/depsSlice";
import type { RootState } from "@/store/types";
import { getErrorMessage } from "@/utils/getErrorMessage";

function* fetchDependenciesStatusWorker() {
	try {
		const response: DependenciesStatusResponse = yield call(
			getDependenciesStatus,
		);
		yield put(fetchDependenciesStatusSuccess(response.status));
	} catch (error) {
		yield put(fetchDependenciesStatusFailure(getErrorMessage(error)));
	}
}

function* fetchDependenciesConfigWorker() {
	try {
		const config: DependenciesConfig = yield call(getDependenciesConfig);
		yield put(
			fetchDependenciesConfigSuccess(
				config.dependencies
					.filter(
						(dependency) =>
							!dependency.selection || dependency.selection?.type === "content",
					)
					.map(parseDependencyConfig),
			),
		);
	} catch (error) {
		yield put(fetchDependenciesConfigFailure(getErrorMessage(error)));
	}
}

function* saveDependenciesConfigWorker() {
	try {
		const dependencies: ReturnType<typeof selectDependencyDrafts> =
			yield select((state: RootState) => selectDependencyDrafts(state));
		const config: DependenciesConfig = {
			dependencies: dependencies.map(serializeDependencyDraft),
		};

		yield call(saveDependenciesConfigRequest, config);
		yield put(saveDependenciesConfigSuccess());
		yield put(fetchDependenciesStatus());
	} catch (error) {
		yield put(saveDependenciesConfigFailure(getErrorMessage(error)));
	}
}

export function* depsSaga() {
	yield takeLatest(fetchDependenciesStatus.type, fetchDependenciesStatusWorker);
	yield takeLatest(fetchDependenciesConfig.type, fetchDependenciesConfigWorker);
	yield takeLatest(saveDependenciesConfig.type, saveDependenciesConfigWorker);
}
