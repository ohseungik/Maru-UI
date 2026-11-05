import { createContext, useContext } from 'react';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

export interface TabsContextValue {
  baseId: string;
  /** The value of the selected tab. */
  value: string;
  select: (value: string) => void;
  orientation: TabsOrientation;
  activation: TabsActivation;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

/** Returns the surrounding Tabs, or throws a clear error when used outside of one. */
export function useTabsContext(consumer: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${consumer}> must be rendered inside <Tabs>.`);
  }
  return context;
}

/** Ids tie a tab to its panel (`aria-controls` / `aria-labelledby`). */
export function getTabId(baseId: string, value: string): string {
  return `${baseId}-tab-${encodeURIComponent(value)}`;
}

export function getPanelId(baseId: string, value: string): string {
  return `${baseId}-panel-${encodeURIComponent(value)}`;
}
