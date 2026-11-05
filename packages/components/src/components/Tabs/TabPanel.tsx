import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { getPanelId, getTabId, useTabsContext } from './TabsContext';
import styles from './Tabs.module.css';

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Matches the `value` of the `Tab` that shows this panel. */
  value: string;
  /**
   * Keep the content in the page (hidden) while the tab is not selected, so its state
   * survives switching. By default only the selected panel renders its content.
   */
  keepMounted?: boolean;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, keepMounted = false, className, children, ...rest },
  ref,
) {
  const { baseId, value: selectedValue } = useTabsContext('TabPanel');
  const selected = value === selectedValue;

  return (
    <div
      {...rest}
      ref={ref}
      role="tabpanel"
      id={getPanelId(baseId, value)}
      aria-labelledby={getTabId(baseId, value)}
      // Focusable so keyboard users can reach panels that contain no focusable content.
      tabIndex={0}
      hidden={!selected}
      className={cx(styles.panel, className)}
    >
      {selected || keepMounted ? children : null}
    </div>
  );
});
