import { Plus } from "lucide-react";
import { useCallback } from "react";
import { DependencyIdentityModal } from "@/components/DependencyIdentityModal";
import { EntryList } from "@/components/dependencies/EntryList";
import { useEditModal } from "@/components/dependencies/useEditModal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { selectIsSavingDependenciesConfig } from "@/store/deps/depsSlice";
import {
	addIdentity,
	removeIdentity,
	saveIdentities,
	selectHasUnsavedIdentityChanges,
	selectIdentitiesError,
	selectIdentityDrafts,
	selectIsLoadingIdentities,
	selectIsSavingIdentities,
	updateIdentity,
} from "@/store/deps/identities/identitiesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	createEmptyDependencyIdentityDraft,
	type DependencyIdentityDraft,
} from "@/types/dependencyIdentity";

type IdentitiesTabProps = {
	onDialogClose: () => void;
};

function getIdentitySummary(identity: DependencyIdentityDraft) {
	return {
		primary: identity.host.trim() || "New identity",
		secondary: identity.scope.trim(),
	};
}

export function IdentitiesTab({ onDialogClose }: IdentitiesTabProps) {
	const dispatch = useAppDispatch();
	const idModal = useEditModal<DependencyIdentityDraft>();

	const identities = useAppSelector(selectIdentityDrafts);
	const identitiesError = useAppSelector(selectIdentitiesError);
	const isIdentitiesLoading = useAppSelector(selectIsLoadingIdentities);
	const isIdentitiesSaving = useAppSelector(selectIsSavingIdentities);
	const isDependenciesSaving = useAppSelector(selectIsSavingDependenciesConfig);
	const hasUnsavedIdentityChanges = useAppSelector(
		selectHasUnsavedIdentityChanges,
	);

	const handleOpenAdd = useCallback(() => {
		idModal.openAdd(createEmptyDependencyIdentityDraft());
	}, [idModal]);

	const handleCloseModal = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				idModal.close();
			}
		},
		[idModal],
	);

	const handleSaveDraft = useCallback(
		(identity: DependencyIdentityDraft) => {
			if (idModal.mode === "add") {
				dispatch(addIdentity(identity));
			} else {
				dispatch(updateIdentity(identity));
			}

			idModal.close();
		},
		[dispatch, idModal],
	);

	const handleSave = useCallback(() => {
		dispatch(saveIdentities());
	}, [dispatch]);

	const isAnySaveInProgress = isDependenciesSaving || isIdentitiesSaving;
	const isAddDisabled = isIdentitiesLoading || isAnySaveInProgress;
	const isSaveDisabled =
		isIdentitiesLoading || isAnySaveInProgress || !hasUnsavedIdentityChanges;

	return (
		<>
			<TabsContent
				value="identities"
				className="mt-0 flex min-h-0 flex-1 flex-col"
			>
				<div className="flex justify-end gap-2 pr-1 pt-2">
					<Button
						variant="outline"
						size="icon-sm"
						onClick={handleOpenAdd}
						disabled={isAddDisabled}
						title="Add identity"
					>
						<Plus />
					</Button>
				</div>

				{identitiesError && (
					<div className="rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
						{identitiesError}
					</div>
				)}

				<EntryList
					items={identities}
					isLoading={isIdentitiesLoading}
					loadingTitle="Loading identities..."
					emptyTitle="No identities configured"
					getSummary={getIdentitySummary}
					onEdit={(identity) => idModal.openEdit(identity)}
					onRemove={(identity) => {
						dispatch(removeIdentity(identity.id));
						idModal.closeIfMatches(identity.id);
					}}
					removeTitle="Remove identity"
				/>

				<DialogFooter className="mt-6">
					<Button
						variant="outline"
						onClick={onDialogClose}
						disabled={isAnySaveInProgress}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						loading={isIdentitiesSaving}
						disabled={isSaveDisabled}
					>
						Save
					</Button>
				</DialogFooter>
			</TabsContent>

			{idModal.isOpen && idModal.draft && idModal.mode && (
				<DependencyIdentityModal
					open={idModal.isOpen}
					mode={idModal.mode}
					identity={idModal.draft}
					onOpenChange={handleCloseModal}
					onSave={handleSaveDraft}
				/>
			)}
		</>
	);
}
