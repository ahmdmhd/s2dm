import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	Folder,
	Hammer,
	Layers,
	Link,
	Package,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddUrlDialog } from "@/components/AddUrlDialog";
import { CliCommandDisplay } from "@/components/CliCommandDisplay";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { DependencyEntry } from "@/components/DependencyEntry";
import { DependencyManagerDialog } from "@/components/DependencyManagerDialog";
import { BuiltSchemaViewerButton } from "@/components/dependencies/BuiltSchemaViewerButton";
import { SourceFileEntry } from "@/components/SourceFileEntry";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FormLabel } from "@/components/ui/form-label";
import { Dropdown, DropdownItem } from "@/components/ui/simple-dropdown";
import { SplitActionButton } from "@/components/ui/split-action-button";
import { StatusBanner } from "@/components/ui/status-banner";
import { useDependencyExploration } from "@/hooks/useDependencyExploration";
import { useFileImport } from "@/hooks/useFileImport";
import {
	buildDependencies,
	selectBuildError,
	selectBuildMessage,
	selectBuiltSchema,
	selectIsBuilding,
} from "@/store/deps/build/buildSlice";
import {
	fetchDependenciesConfig,
	fetchDependenciesStatus,
	selectDependencyDrafts,
	selectDependencyStatus,
	selectIsLoadingDependencyStatus,
	selectIsSavingDependenciesConfig,
} from "@/store/deps/depsSlice";
import { selectIsSavingIdentities } from "@/store/deps/identities/identitiesSlice";
import { selectIsResolvingDependencies } from "@/store/deps/resolve/resolveSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSourceFiles, setSourceFiles } from "@/store/schema/schemaSlice";
import { selectIsValidating } from "@/store/validation/validationSlice";
import type { ImportedFile } from "@/types/importedFile";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { isGraphQLFile } from "@/utils/validation";

type FileWithPath = File & {
	webkitRelativePath?: string;
};

type FileListProps = {
	onCompose?: (includeBuiltDependencies: boolean) => void;
};

export function FileList({ onCompose }: FileListProps) {
	const dispatch = useAppDispatch();
	const builtDependenciesSchema = useAppSelector(selectBuiltSchema);
	const dependencies = useAppSelector(selectDependencyDrafts);
	const dependenciesBuildError = useAppSelector(selectBuildError);
	const dependenciesBuildMessage = useAppSelector(selectBuildMessage);
	const dependencyStatus = useAppSelector(selectDependencyStatus);
	const isDependenciesBuilding = useAppSelector(selectIsBuilding);
	const isDependencyStatusLoading = useAppSelector(
		selectIsLoadingDependencyStatus,
	);
	const isDependenciesSaving = useAppSelector(selectIsSavingDependenciesConfig);
	const isDependenciesResolving = useAppSelector(selectIsResolvingDependencies);
	const isIdentitiesSaving = useAppSelector(selectIsSavingIdentities);
	const isValidating = useAppSelector(selectIsValidating);
	const files = useAppSelector(selectSourceFiles);

	const resolvedDependencies = useMemo(
		() =>
			dependencies.filter((dependency) =>
				Boolean(dependency.schemaContent?.trim()),
			),
		[dependencies],
	);

	const {
		exploringDependencyId,
		isExploring,
		toggleExploration,
		pendingAction,
		dismissPendingAction,
		confirmPendingAction,
	} = useDependencyExploration(resolvedDependencies);

	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [showDependenciesDialog, setShowDependenciesDialog] = useState(false);
	const [showUrlDialog, setShowUrlDialog] = useState(false);
	const [error, setError] = useState<string>("");
	const [includeBuiltDependencies, setIncludeBuiltDependencies] =
		useState(false);
	const hasBuiltDependenciesSchema = Boolean(builtDependenciesSchema?.trim());
	const includeBuiltDependenciesTooltip = hasBuiltDependenciesSchema
		? undefined
		: "Build dependencies in the Dependencies tab before including them in composition.";
	const isBuildDisabled =
		dependencyStatus !== "resolved" ||
		isDependencyStatusLoading ||
		isDependenciesSaving ||
		isIdentitiesSaving ||
		isDependenciesResolving ||
		isDependenciesBuilding;

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		dispatch(fetchDependenciesStatus());
		dispatch(fetchDependenciesConfig());
	}, [dispatch]);

	const handleImportedFiles = useCallback(
		async (selectedFiles: FileList) => {
			const graphqlFiles: File[] = [];

			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				if (isGraphQLFile(file.name)) {
					graphqlFiles.push(file);
				}
			}

			if (graphqlFiles.length === 0) {
				setError(
					"No GraphQL files found. Please select files with .graphql or .gql extensions.",
				);
				return;
			}

			try {
				const fileData = await Promise.all(
					graphqlFiles.map(async (file) => {
						const fileWithPath = file as FileWithPath;
						return {
							name: file.name,
							path: fileWithPath.webkitRelativePath || file.name,
							content: await file.text(),
							type: "file" as const,
						};
					}),
				);

				const updatedFiles = [...files, ...fileData];
				dispatch(setSourceFiles(updatedFiles));
				setError("");
			} catch (err) {
				setError(`Failed to read files: ${getErrorMessage(err)}`);
			}
		},
		[files, dispatch],
	);

	const fileImport = useFileImport({
		accept: ".graphql,.gql",
		multiple: true,
		onFilesSelected: handleImportedFiles,
	});

	const folderImport = useFileImport({
		directory: true,
		multiple: true,
		onFilesSelected: handleImportedFiles,
	});

	const handleAddUrl = useCallback(
		(url: string) => {
			const urlEntry: ImportedFile = {
				name: url,
				path: url,
				type: "url",
			};

			const updatedFiles = [...files, urlEntry];
			dispatch(setSourceFiles(updatedFiles));
		},
		[files, dispatch],
	);

	const handleRemove = useCallback(
		(filePath: string) => {
			const updatedFiles = files.filter((f) => f.path !== filePath);
			dispatch(setSourceFiles(updatedFiles));
		},
		[files, dispatch],
	);

	const handleClearAll = useCallback(() => {
		setShowClearConfirm(true);
	}, []);

	const handleBuild = useCallback(() => {
		dispatch(buildDependencies({ autoPrefix: false }));
	}, [dispatch]);

	const handleBuildWithAutoPrefix = useCallback(() => {
		dispatch(buildDependencies({ autoPrefix: true }));
	}, [dispatch]);

	const confirmClearAll = useCallback(() => {
		setShowClearConfirm(false);
		dispatch(setSourceFiles([]));
	}, [dispatch]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = files.findIndex((f) => f.path === active.id);
			const newIndex = files.findIndex((f) => f.path === over.id);
			const reordered = arrayMove(files, oldIndex, newIndex);
			dispatch(setSourceFiles(reordered));
		}
	};

	let buttonContent: React.ReactNode;
	if (isValidating) {
		buttonContent = "Validating...";
	} else {
		buttonContent = (
			<>
				<Layers />
				Compose and Validate
			</>
		);
	}

	const renderFileList = () => {
		if (files.length === 0) {
			return null;
		}

		const fileCountText = `${files.length} file${files.length !== 1 ? "s" : ""}`;
		const filePaths = files.map((f) => f.path);
		const fileItems = files.map((file) => (
			<SourceFileEntry key={file.path} file={file} onRemove={handleRemove} />
		));

		return (
			<CollapsibleSection title={fileCountText} className="mt-2">
				<div className="overflow-y-auto max-h-80">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={filePaths}
							strategy={verticalListSortingStrategy}
						>
							<ul className="space-y-1 py-2">{fileItems}</ul>
						</SortableContext>
					</DndContext>
				</div>
			</CollapsibleSection>
		);
	};

	const renderDependenciesList = () => {
		if (dependencyStatus !== "resolved") {
			return null;
		}

		if (resolvedDependencies.length === 0) {
			return null;
		}

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
							className="flex-1"
							stretchMainButton={true}
						/>
						<BuiltSchemaViewerButton />
					</div>
					{dependenciesBuildError && (
						<StatusBanner variant="destructive">
							{dependenciesBuildError}
						</StatusBanner>
					)}
					{dependenciesBuildMessage && (
						<StatusBanner variant="success">
							{dependenciesBuildMessage}
						</StatusBanner>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col">
			<div className="flex justify-end gap-2 p-2">
				<Button
					variant="outline"
					size="icon"
					onClick={() => setShowDependenciesDialog(true)}
					disabled={isExploring}
					title="Manage dependencies"
				>
					<Package className="h-5 w-5" />
				</Button>
				<Dropdown
					trigger={
						<Button variant="outline" size="icon" title="Add schemas">
							<Plus className="h-5 w-5" />
						</Button>
					}
					align="end"
				>
					<DropdownItem onClick={fileImport.openImportInput}>
						<Upload className="h-4 w-4" />
						Upload Files
					</DropdownItem>
					<DropdownItem onClick={folderImport.openImportInput}>
						<Folder className="h-4 w-4" />
						Upload Directory
					</DropdownItem>
					<DropdownItem onClick={() => setShowUrlDialog(true)}>
						<Link className="h-4 w-4" />
						Add URL
					</DropdownItem>
				</Dropdown>
				<Button
					variant="outline"
					size="icon"
					onClick={handleClearAll}
					disabled={files.length === 0}
					title="Remove all files"
					className="text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					<Trash2 className="h-5 w-5" />
				</Button>
			</div>

			{error && (
				<div className="mx-2 mb-2 p-2 text-sm bg-destructive/10 text-destructive rounded border border-destructive">
					{error}
				</div>
			)}

			{renderDependenciesList()}

			{renderFileList()}

			{files.length > 0 && (
				<div className="px-2 pt-2">
					<div className="mb-2 flex items-center justify-between gap-3">
						<div
							className="flex items-center space-x-2"
							title={includeBuiltDependenciesTooltip}
						>
							<Checkbox
								id="include-built-dependencies"
								checked={includeBuiltDependencies}
								disabled={!hasBuiltDependenciesSchema || isValidating}
								onCheckedChange={(checked) =>
									setIncludeBuiltDependencies(checked === true)
								}
							/>
							<FormLabel
								htmlFor="include-built-dependencies"
								className={cn(
									"text-sm",
									!hasBuiltDependenciesSchema && "text-muted-foreground",
								)}
							>
								<span className="cursor-pointer">
									Include built dependencies in composition
								</span>
							</FormLabel>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="w-full"
						onClick={() => onCompose?.(includeBuiltDependencies)}
						disabled={files.length === 0}
						loading={isValidating}
						title={"Compose and validate schema files"}
					>
						{buttonContent}
					</Button>
				</div>
			)}

			{files.length > 0 && (
				<div className="px-2 pt-4 pb-2">
					<CliCommandDisplay type="compose" />
				</div>
			)}

			<input {...fileImport.hiddenInputProps} />
			<input {...folderImport.hiddenInputProps} />

			<ConfirmActionDialog
				open={showClearConfirm}
				onOpenChange={setShowClearConfirm}
				title="Remove all files?"
				description={
					<>
						This will remove all {files.length} file
						{files.length !== 1 ? "s" : ""} from the list. This action cannot be
						undone.
					</>
				}
				confirmLabel="Remove All"
				onConfirm={confirmClearAll}
			/>

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

			<AddUrlDialog
				open={showUrlDialog}
				onOpenChange={setShowUrlDialog}
				onAdd={handleAddUrl}
			/>

			<DependencyManagerDialog
				open={showDependenciesDialog}
				onOpenChange={setShowDependenciesDialog}
			/>
		</div>
	);
}
