import type { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { ApiValidationError, validateSchemas } from "@/api/s2dm";
import { mapImportedFilesToSchemaInputs } from "@/api/schemaInputs";
import type { ExportResponse } from "@/api/types";
import { setOriginalSchema, setSourceFiles } from "@/store/schema/schemaSlice";
import {
	type ValidateAndComposePayload,
	validateAndCompose,
	validationFailure,
	validationSuccess,
} from "@/store/validation/validationSlice";
import { getErrorMessage } from "@/utils/getErrorMessage";

function* validateAndComposeWorker(
	action: PayloadAction<ValidateAndComposePayload>,
) {
	const sourceFiles = action.payload.sourceFiles;
	const sourceContents = action.payload.sourceContents
		.map((content) => content.trim())
		.filter((content) => content.length > 0);

	if (sourceFiles.length === 0) {
		yield put(setOriginalSchema(""));
		yield put(setSourceFiles([]));
		yield put(validationSuccess());
		return;
	}

	try {
		const schemas = mapImportedFilesToSchemaInputs(sourceFiles);
		for (const content of sourceContents) {
			schemas.push({ type: "content", content });
		}

		const response: ExportResponse = yield call(validateSchemas, schemas);
		const composedSchema = response.result[0] || "";

		yield put(setSourceFiles(sourceFiles));
		yield put(validationSuccess());
		yield put(setOriginalSchema(composedSchema));
	} catch (err) {
		if (err instanceof ApiValidationError) {
			yield put(validationFailure(err.errors));
		} else {
			const errorMsg = getErrorMessage(err);
			yield put(validationFailure([errorMsg]));
		}
		yield put(setOriginalSchema(""));
	}
}

export function* validationSaga() {
	yield takeLatest(validateAndCompose.type, validateAndComposeWorker);
}
