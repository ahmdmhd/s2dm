import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/simple-dropdown";

type SplitActionOption = {
	label: string;
	onClick: () => void;
};

type SplitActionButtonProps = {
	label: string;
	onClick: () => void;
	title: string;
	optionsTitle: string;
	options: SplitActionOption[];
	disabled?: boolean;
	loading?: boolean;
};

export function SplitActionButton({
	label,
	onClick,
	title,
	optionsTitle,
	options,
	disabled = false,
	loading = false,
}: SplitActionButtonProps) {
	const menuTrigger = (
		<Button
			variant="outline"
			size="icon-sm"
			disabled={disabled}
			title={optionsTitle}
			className="rounded-l-none border-l-0"
		>
			<ChevronDown className="h-4 w-4" />
		</Button>
	);

	let trailingControl = menuTrigger;
	if (!disabled) {
		const optionItems = options.map((option) => (
			<DropdownItem key={option.label} onClick={option.onClick}>
				{option.label}
			</DropdownItem>
		));

		trailingControl = (
			<Dropdown trigger={menuTrigger} align="end">
				{optionItems}
			</Dropdown>
		);
	}

	return (
		<div className="flex items-center">
			<Button
				variant="outline"
				size="sm"
				onClick={onClick}
				loading={loading}
				disabled={disabled}
				title={title}
				className="rounded-r-none"
			>
				{label}
			</Button>
			{trailingControl}
		</div>
	);
}
