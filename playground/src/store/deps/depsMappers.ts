import { nanoid } from "@reduxjs/toolkit";
import type { ContentInput, DependencyConfigEntry } from "@/api/types";
import type { DependencyDraft } from "@/types/dependency";

export function parseDependencyConfig(
	dependency: DependencyConfigEntry,
): DependencyDraft {
	return {
		id: nanoid(),
		name: dependency.name,
		version: dependency.version,
		source: dependency.source,
		artifact: dependency.artifact,
		selectionType: dependency.selection?.type || null,
		selectionContent: dependency.selection?.content || null,
	};
}

export function serializeDependencyDraft(
	dependency: DependencyDraft,
): DependencyConfigEntry {
	const trimmedSelectionContent = dependency.selectionContent?.trim() || null;
	let selection: ContentInput | null = null;
	if (trimmedSelectionContent) {
		selection = { type: "content", content: trimmedSelectionContent };
	}

	return {
		name: dependency.name.trim(),
		version: dependency.version.trim(),
		source: dependency.source.trim(),
		artifact: dependency.artifact.trim(),
		selection,
	};
}
