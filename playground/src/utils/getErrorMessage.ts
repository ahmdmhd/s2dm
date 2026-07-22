import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function getAxiosErrorMessage(error: unknown): string | null {
	if (!(error instanceof AxiosError)) {
		return null;
	}

	const responseMessage = error.response?.data?.message;
	if (typeof responseMessage === "string" && responseMessage.trim().length > 0) {
		return responseMessage;
	}

	if (error.code === "ECONNABORTED") {
		return "The API request timed out";
	}

	if (error.code === "ERR_NETWORK") {
		return "Cannot reach the API server";
	}

	return null;
}
