import { createContext, type ReactNode, useContext, useMemo } from "react";

type InsightsHostDefaultsValue = {
	selectableCards: boolean;
};

const FALLBACK: InsightsHostDefaultsValue = {
	selectableCards: false,
};

const InsightsHostDefaultsContext = createContext(FALLBACK);

type InsightsHostDefaultsProps = Partial<InsightsHostDefaultsValue> & {
	children: ReactNode;
};

/**
 * Declare how the shared insights components behave in this host.
 *
 * @param selectableCards - True where cards are tiles in a grid, so each highlights
 *   while its own detail is open and offers a "View details" link. False where a card
 *   owns a route and its detail opens by navigation instead.
 * @param children - The insights subtree these choices apply to.
 * @returns The subtree, with the host's choices available through context.
 */
export function InsightsHostDefaults({
	selectableCards = FALLBACK.selectableCards,
	children,
}: InsightsHostDefaultsProps) {
	const value = useMemo(() => ({ selectableCards }), [selectableCards]);

	return (
		<InsightsHostDefaultsContext.Provider value={value}>
			{children}
		</InsightsHostDefaultsContext.Provider>
	);
}

export function useInsightsHostDefaults(): InsightsHostDefaultsValue {
	return useContext(InsightsHostDefaultsContext);
}
