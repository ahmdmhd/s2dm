import { Hammer } from "lucide-react";
import { useCallback, useMemo } from "react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { DependencyEntry } from "@/components/DependencyEntry";
import { BuiltSchemaViewerButton } from "@/components/dependencies/BuiltSchemaViewerButton";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SplitActionButton } from "@/components/ui/split-action-button";
import { StatusBanner } from "@/components/ui/status-banner";
import { useDependencyExploration } from "@/hooks/useDependencyExploration";
import {
	buildDependencies,
	selectBuildError,
	selectBuildMessage,
	selectIsBuilding,
} from "@/store/deps/build/buildSlice";
import {
	selectDependencyDrafts,
	selectDependencyStatus,
	selectIsLoadingDependencyStatus,
	selectIsSavingDependenciesConfig,
} from "@/store/deps/depsSlice";
import { selectIsSavingIdentities } from "@/store/deps/identities/identitiesSlice";
import { selectIsResolvingDependencies } from "@/store/deps/resolve/resolveSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function ResolvedDependenciesSection() {
	const dispatch = useAppDispatch();
	const dependencies = useAppSelector(selectDependencyDrafts);
	const dependencyStatus = useAppSelector(selectDependencyStatus);
	const isBuilding = useAppSelector(selectIsBuilding);
	const buildError = useAppSelector(selectBuildError);
	const buildMessage = useAppSelector(selectBuildMessage);
	const isDependencyStatusLoading = useAppSelector(
		selectIsLoadingDependencyStatus,
	);
	const isDependenciesSaving = useAppSelector(selectIsSavingDependenciesConfig);
	const isDependenciesResolving = useAppSelector(selectIsResolvingDependencies);
	const isIdentitiesSaving = useAppSelector(selectIsSavingIdentities);

	const resolvedDependencies = useMemo(
		() =>
			dependencies.filter((dependency) =>
				Boolean(dependency.schemaContent?.trim()),
			),
		[dependencies],
	);

	const {
		exploringDependencyId,
		toggleExploration,
		pendingAction,
		dismissPendingAction,
		confirmPendingAction,
	} = useDependencyExploration(resolvedDependencies);

	const handleBuild = useCallback(() => {
		dispatch(buildDependencies({ autoPrefix: false }));
	}, [dispatch]);

	const handleBuildWithAutoPrefix = useCallback(() => {
		dispatch(buildDependencies({ autoPrefix: true }));
	}, [dispatch]);

	if (dependencyStatus !== "resolved" || resolvedDependencies.length === 0) {
		return null;
	}

	const isBuildDisabled =
		isDependencyStatusLoading ||
		isDependenciesSaving ||
		isIdentitiesSaving ||
		isDependenciesResolving ||
		isBuilding;

	const dependencyCountText = `${resolvedDependencies.length} dependenc${resolvedDependencies.length === 1 ? "y" : "ies"}`;

	return (
		<div className="space-y-2">
			<CollapsibleSection title={dependencyCountText}>
				<ul className="space-y-1 py-2">
					{resolvedDependencies.map((dependency) => (
						<DependencyEntry
							key={dependency.id}
							dependency={dependency}
							isExploring={dependency.id === exploringDependencyId}
							onToggleExplore={toggleExploration}
						/>
					))}
				</ul>
			</CollapsibleSection>
			<div className="px-2 space-y-2">
				<div className="flex gap-2">
					<SplitActionButton
						label="Build"
						icon={<Hammer />}
						onClick={handleBuild}
						loading={isBuilding}
						disabled={isBuildDisabled}
						title="Build dependencies"
						optionsTitle="Build options"
						options={[
							{
								label: "Build and Auto-prefix",
								onClick: handleBuildWithAutoPrefix,
							},
						]}
						className="flex-1"
						stretchMainButton={true}
					/>
					<BuiltSchemaViewerButton />
				</div>
				{buildError && (
					<StatusBanner variant="destructive">{buildError}</StatusBanner>
				)}
				{buildMessage && (
					<StatusBanner variant="success">{buildMessage}</StatusBanner>
				)}
			</div>

			<ConfirmActionDialog
				open={Boolean(pendingAction)}
				onOpenChange={(open) => {
					if (!open) {
						dismissPendingAction();
					}
				}}
				title="Discard selection changes?"
				description={
					pendingAction?.kind === "switch"
						? "You have unsaved selection query changes. Switch to a different dependency and discard them?"
						: "You have unsaved selection query changes. Exit exploration mode and discard them?"
				}
				confirmLabel={
					pendingAction?.kind === "switch"
						? "Switch Dependency"
						: "Exit Exploration"
				}
				onConfirm={confirmPendingAction}
			/>
		</div>
	);
}
