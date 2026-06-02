import { Eye, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { DependencyModal } from "@/components/DependencyModal";
import { EntryList } from "@/components/dependencies/EntryList";
import { useEditModal } from "@/components/dependencies/useEditModal";
import { TextEditor } from "@/components/TextEditor";
import { TextEditorDialog } from "@/components/TextEditorDialog";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { SplitActionButton } from "@/components/ui/split-action-button";
import { TabsContent } from "@/components/ui/tabs";
import {
	buildDependencies,
	selectBuildError,
	selectBuildMessage,
	selectBuiltSchema,
	selectIsBuilding,
} from "@/store/deps/build/buildSlice";
import {
	addDependency,
	removeDependency,
	saveDependenciesConfig,
	selectDependenciesError,
	selectDependencyDrafts,
	selectDependencyStatus,
	selectHasUnsavedDependencyChanges,
	selectIsLoadingDependenciesConfig,
	selectIsLoadingDependencyStatus,
	selectIsSavingDependenciesConfig,
	updateDependency,
} from "@/store/deps/depsSlice";
import { selectIsSavingIdentities } from "@/store/deps/identities/identitiesSlice";
import {
	resolveDependencies,
	selectIsResolvingDependencies,
	selectResolveWarnings,
} from "@/store/deps/resolve/resolveSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	createEmptyDependencyDraft,
	type DependencyDraft,
} from "@/types/dependency";

type DependenciesTabProps = {
	onDialogClose: () => void;
};

function getDependencySummary(dependency: DependencyDraft) {
	return {
		primary: dependency.name.trim() || "New dependency",
		secondary: dependency.version.trim(),
	};
}

export function DependenciesTab({ onDialogClose }: DependenciesTabProps) {
	const dispatch = useAppDispatch();
	const depModal = useEditModal<DependencyDraft>();
	const [isBuiltSchemaDialogOpen, setIsBuiltSchemaDialogOpen] = useState(false);

	const dependencies = useAppSelector(selectDependencyDrafts);
	const dependenciesError = useAppSelector(selectDependenciesError);
	const dependencyWarnings = useAppSelector(selectResolveWarnings);
	const dependenciesBuildMessage = useAppSelector(selectBuildMessage);
	const dependenciesBuildError = useAppSelector(selectBuildError);
	const isDependenciesLoading = useAppSelector(
		selectIsLoadingDependenciesConfig,
	);
	const isDependenciesSaving = useAppSelector(selectIsSavingDependenciesConfig);
	const isDependenciesResolving = useAppSelector(selectIsResolvingDependencies);
	const isDependenciesBuilding = useAppSelector(selectIsBuilding);
	const isIdentitiesSaving = useAppSelector(selectIsSavingIdentities);
	const dependencyStatus = useAppSelector(selectDependencyStatus);
	const isDependencyStatusLoading = useAppSelector(
		selectIsLoadingDependencyStatus,
	);
	const hasUnsavedDependencyChanges = useAppSelector(
		selectHasUnsavedDependencyChanges,
	);
	const builtDependenciesSchema = useAppSelector(selectBuiltSchema);

	const handleOpenAdd = useCallback(() => {
		depModal.openAdd(createEmptyDependencyDraft());
	}, [depModal]);

	const handleCloseModal = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				depModal.close();
			}
		},
		[depModal],
	);

	const handleSaveDraft = useCallback(
		(dependency: DependencyDraft) => {
			if (depModal.mode === "add") {
				dispatch(addDependency(dependency));
			} else {
				dispatch(updateDependency(dependency));
			}

			depModal.close();
		},
		[depModal, dispatch],
	);

	const handleSave = useCallback(() => {
		dispatch(saveDependenciesConfig());
	}, [dispatch]);

	const handleResolve = useCallback(() => {
		dispatch(resolveDependencies({ clean: false }));
	}, [dispatch]);

	const handleCleanResolve = useCallback(() => {
		dispatch(resolveDependencies({ clean: true }));
	}, [dispatch]);

	const handleBuild = useCallback(() => {
		dispatch(buildDependencies({ autoPrefix: false }));
	}, [dispatch]);

	const handleBuildWithAutoPrefix = useCallback(() => {
		dispatch(buildDependencies({ autoPrefix: true }));
	}, [dispatch]);

	const isAnySaveInProgress = isDependenciesSaving || isIdentitiesSaving;
	const isAddDisabled =
		isDependenciesLoading ||
		isAnySaveInProgress ||
		isDependenciesResolving ||
		isDependenciesBuilding;
	const isResolveDisabled =
		isDependencyStatusLoading ||
		isDependenciesSaving ||
		isDependenciesBuilding ||
		isDependenciesResolving;
	const isBuildDisabled =
		dependencyStatus !== "resolved" ||
		isDependencyStatusLoading ||
		isDependenciesSaving ||
		isIdentitiesSaving ||
		isDependenciesResolving ||
		isDependenciesBuilding;
	const isSaveDisabled =
		isDependenciesLoading ||
		isAnySaveInProgress ||
		isDependenciesResolving ||
		isDependenciesBuilding ||
		!hasUnsavedDependencyChanges;
	const hasBuiltDependenciesSchema = Boolean(builtDependenciesSchema?.trim());

	return (
		<>
			<TabsContent
				value="dependencies"
				className="mt-0 flex min-h-0 flex-1 flex-col"
			>
				<div className="flex justify-end gap-2 pr-1 pt-2">
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setIsBuiltSchemaDialogOpen(true)}
						disabled={!hasBuiltDependenciesSchema}
						title="View built dependency schema"
					>
						<Eye />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={handleOpenAdd}
						disabled={isAddDisabled}
						title="Add dependency"
					>
						<Plus />
					</Button>
				</div>

				<div className="space-y-2 px-1 pt-2">
					{dependenciesError && (
						<div className="rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
							{dependenciesError}
						</div>
					)}

					{dependenciesBuildError && (
						<div className="rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
							{dependenciesBuildError}
						</div>
					)}

					{dependencyWarnings.length > 0 && (
						<div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-sm text-amber-700 dark:text-amber-300">
							{dependencyWarnings.join("\n")}
						</div>
					)}

					{dependenciesBuildMessage && (
						<div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm text-emerald-700 dark:text-emerald-300">
							{dependenciesBuildMessage}
						</div>
					)}
				</div>
				<EntryList
					items={dependencies}
					isLoading={isDependenciesLoading}
					loadingTitle="Loading dependencies..."
					emptyTitle="No dependencies configured"
					getSummary={getDependencySummary}
					onEdit={(dependency) => depModal.openEdit(dependency)}
					onRemove={(dependency) => {
						dispatch(removeDependency(dependency.id));
						depModal.closeIfMatches(dependency.id);
					}}
					removeTitle="Remove dependency"
				/>

				<DialogFooter className="mt-6">
					<Button
						variant="outline"
						onClick={onDialogClose}
						disabled={isAnySaveInProgress}
					>
						Cancel
					</Button>
					<SplitActionButton
						label="Resolve"
						onClick={handleResolve}
						loading={isDependenciesResolving}
						disabled={isResolveDisabled}
						title="Resolve dependencies"
						optionsTitle="Resolve options"
						options={[
							{ label: "Clean and Resolve", onClick: handleCleanResolve },
						]}
					/>
					<SplitActionButton
						label="Build"
						onClick={handleBuild}
						loading={isDependenciesBuilding}
						disabled={isBuildDisabled}
						title="Build dependencies"
						optionsTitle="Build options"
						options={[
							{
								label: "Build and Auto-prefix",
								onClick: handleBuildWithAutoPrefix,
							},
						]}
					/>
					<Button
						onClick={handleSave}
						loading={isDependenciesSaving}
						disabled={isSaveDisabled}
					>
						Save
					</Button>
				</DialogFooter>
			</TabsContent>

			{depModal.isOpen && depModal.draft && depModal.mode && (
				<DependencyModal
					open={depModal.isOpen}
					mode={depModal.mode}
					dependency={depModal.draft}
					onOpenChange={handleCloseModal}
					onSave={handleSaveDraft}
				/>
			)}

			<TextEditorDialog
				open={isBuiltSchemaDialogOpen}
				onOpenChange={setIsBuiltSchemaDialogOpen}
				title="Built Dependency Schema"
			>
				<TextEditor
					language="graphql"
					value={builtDependenciesSchema ?? ""}
					readOnly
					fullscreenTitle="Built Dependency Schema"
					fileName="built-dependencies.graphql"
					isExpandable={false}
				/>
			</TextEditorDialog>
		</>
	);
}
