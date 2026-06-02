import { useCallback, useEffect, useState } from "react";
import { DependenciesTab } from "@/components/dependencies/DependenciesTab";
import { DependencyStatusBadge } from "@/components/dependencies/DependencyStatusBadge";
import { IdentitiesTab } from "@/components/dependencies/IdentitiesTab";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	fetchDependenciesConfig,
	fetchDependenciesStatus,
	selectDependencyStatus,
	selectDependencyStatusError,
	selectIsLoadingDependencyStatus,
} from "@/store/deps/depsSlice";
import { fetchIdentities } from "@/store/deps/identities/identitiesSlice";
import { selectIsResolvingDependencies } from "@/store/deps/resolve/resolveSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type DependencyManagerDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type DependencyManagerTab = "dependencies" | "identities";

export function DependencyManagerDialog({
	open,
	onOpenChange,
}: DependencyManagerDialogProps) {
	const dispatch = useAppDispatch();
	const [activeTab, setActiveTab] =
		useState<DependencyManagerTab>("dependencies");
	const dependencyStatus = useAppSelector(selectDependencyStatus);
	const dependencyStatusError = useAppSelector(selectDependencyStatusError);
	const isDependencyStatusLoading = useAppSelector(
		selectIsLoadingDependencyStatus,
	);
	const isDependenciesResolving = useAppSelector(selectIsResolvingDependencies);

	const handleDialogOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				setActiveTab("dependencies");
			}

			onOpenChange(isOpen);
		},
		[onOpenChange],
	);

	const handleDialogClose = useCallback(() => {
		handleDialogOpenChange(false);
	}, [handleDialogOpenChange]);

	useEffect(() => {
		if (!open) {
			return;
		}

		setActiveTab("dependencies");
		dispatch(fetchDependenciesStatus());
		dispatch(fetchDependenciesConfig());
		dispatch(fetchIdentities());
	}, [dispatch, open]);

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className="flex h-[50vh] w-[90vw] max-w-4xl flex-col sm:max-w-4xl">
				<Tabs
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as DependencyManagerTab)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<DialogHeader>
						<div className="space-y-3">
							<div className="flex items-start gap-4 pr-8">
								<div className="flex flex-wrap items-center gap-2">
									<DialogTitle>Manage Dependencies</DialogTitle>
									<DependencyStatusBadge
										status={dependencyStatus}
										isLoading={isDependencyStatusLoading}
										error={dependencyStatusError}
										isRefreshDisabled={isDependenciesResolving}
										onRefresh={() => dispatch(fetchDependenciesStatus())}
									/>
								</div>
							</div>
							<div className="flex justify-center">
								<TabsList>
									<TabsTrigger value="dependencies">Dependencies</TabsTrigger>
									<TabsTrigger value="identities">Identities</TabsTrigger>
								</TabsList>
							</div>
						</div>
					</DialogHeader>

					<DependenciesTab onDialogClose={handleDialogClose} />
					<IdentitiesTab onDialogClose={handleDialogClose} />
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
