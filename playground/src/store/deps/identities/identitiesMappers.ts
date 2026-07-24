import { nanoid } from "@reduxjs/toolkit";
import type {
	DependenciesIdentities,
	DependencyIdentityEntry,
} from "@/api/types";
import type { DependencyIdentityDraft } from "@/types/dependencyIdentity";
import { parseYamlObject } from "@/utils/parseYamlObject";

export function parseDependenciesIdentitiesYaml(
	fileContent: string,
): DependenciesIdentities {
	const identities = parseYamlObject<DependenciesIdentities>(
		fileContent,
		"Dependency identities root must be a YAML object.",
	);
	if (!Array.isArray(identities.identities)) {
		throw new Error(
			"Dependency identities config must contain an 'identities' array.",
		);
	}

	return identities;
}

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
