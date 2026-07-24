import { createSelector } from "@reduxjs/toolkit";
import { selectComposedDependenciesSchema } from "@/store/deps/compose/composeSlice";
import {
	selectIncludeBuiltDependencies,
	selectSourceFiles,
} from "@/store/schema/schemaSlice";
import type { SchemaSource } from "@/types/schemaSource";

export const selectComposedSources = createSelector(
	[
		selectSourceFiles,
		selectIncludeBuiltDependencies,
		selectComposedDependenciesSchema,
	],
	(
		sourceFiles,
		includeBuiltDependencies,
		composedDependenciesSchema,
	): SchemaSource[] => {
		if (includeBuiltDependencies && composedDependenciesSchema?.trim()) {
			return [
				...sourceFiles,
				{ type: "content", content: composedDependenciesSchema },
			];
		}
		return sourceFiles;
	},
);
