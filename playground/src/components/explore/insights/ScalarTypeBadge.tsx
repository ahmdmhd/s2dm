export function ScalarTypeBadge({ isBuiltin }: { isBuiltin: boolean }) {
	return (
		<span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
			{isBuiltin ? "built-in" : "custom"}
		</span>
	);
}
