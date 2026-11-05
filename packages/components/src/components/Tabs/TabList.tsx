import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useTabsContext } from './TabsContext';
import styles from './Tabs.module.css';

export type TabListProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'>;

/**
 * The row (or column) of tabs. The arrow keys, Home and End are handled by each `Tab`,
 * which is the element that actually has focus. Give the list an `aria-label` so the
 * group has a name.
 */
export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { className, ...rest },
  ref,
) {
  const { orientation } = useTabsContext('TabList');

  return (
    <div
      {...rest}
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cx(styles.list, className)}
      data-orientation={orientation}
    />
  );
});
