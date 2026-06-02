import { nanoid } from "@reduxjs/toolkit";
import type { DependencyIdentityEntry } from "@/api/types";
import type { DependencyIdentityDraft } from "@/types/dependencyIdentity";

export function parseDependencyIdentity(
	identity: DependencyIdentityEntry,
): DependencyIdentityDraft {
	return {
		id: nanoid(),
		host: identity.host,
		scope: identity.scope ?? "",
		token: identity.token,
	};
}

export function serializeDependencyIdentityDraft(
	identity: DependencyIdentityDraft,
): DependencyIdentityEntry {
	const trimmedScope = identity.scope.trim();

	return {
		host: identity.host.trim(),
		scope: trimmedScope || null,
		token: identity.token.trim(),
	};
}
