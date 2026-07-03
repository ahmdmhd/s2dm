import type { ReactNode } from "react";
import { Pane } from "@/components/Pane";
import { selectExploringDependencyId } from "@/store/deps/dependencyExploration/dependencyExplorationSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFilteredSchema } from "@/store/schema/schemaSlice";
import {
	selectResultPaneCollapsed,
	toggleResultPane,
} from "@/store/ui/uiSlice";

type DetailsPaneProps = {
	children: ReactNode;
	position?: "none" | "left" | "center" | "right";
	collapsible?: boolean;
	className?: string;
};

export function DetailsPane({
	children,
	position = "right",
	collapsible,
	className = "bg-card",
}: DetailsPaneProps) {
	const dispatch = useAppDispatch();
	const isCollapsed = useAppSelector(selectResultPaneCollapsed);
	const exploringDependencyId = useAppSelector(selectExploringDependencyId);
	const filteredSchema = useAppSelector(selectFilteredSchema);
	const hasFilteredSchema = filteredSchema.trim().length > 0;
	const canCollapsePane = Boolean(
		collapsible && hasFilteredSchema && !exploringDependencyId,
	);
	const shouldCollapsePane = !hasFilteredSchema || isCollapsed;

	return (
		<Pane
			className={className}
			position={position}
			collapsible={canCollapsePane}
			isCollapsed={shouldCollapsePane}
			onToggleCollapse={
				canCollapsePane ? () => dispatch(toggleResultPane()) : undefined
			}
		>
			{children}
		</Pane>
	);
}
