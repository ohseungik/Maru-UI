import {
  forwardRef,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cx } from '../../utils/cx';
import { getPanelId, getTabId, useTabsContext } from './TabsContext';
import styles from './Tabs.module.css';

export interface TabProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'role' | 'value'
> {
  /** Matches the `value` of the `TabPanel` this tab shows. */
  value: string;
}

/**
 * One tab. Only the selected tab is in the Tab key order (roving tabindex); the arrow
 * keys, Home and End move focus to another tab.
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, className, onClick, onFocus, onKeyDown, ...rest },
  ref,
) {
  const { baseId, value: selectedValue, select, orientation, activation } = useTabsContext('Tab');
  const selected = value === selectedValue;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) select(value);
  }

  function handleFocus(event: FocusEvent<HTMLButtonElement>) {
    onFocus?.(event);
    if (!event.defaultPrevented && activation === 'automatic') select(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const list = event.currentTarget.closest('[role="tablist"]');
    if (!list) return;

    const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)'));
    const current = tabs.indexOf(event.currentTarget);
    if (current === -1) return;

    // In right-to-left text the "next" tab is on the left.
    const rtl = getComputedStyle(list).direction === 'rtl';
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';

    let target: HTMLElement | undefined;
    if (event.key === nextKey) {
      target = tabs[(current + 1) % tabs.length];
    } else if (event.key === previousKey) {
      target = tabs[(current - 1 + tabs.length) % tabs.length];
    } else if (event.key === 'Home') {
      target = tabs[0];
    } else if (event.key === 'End') {
      target = tabs[tabs.length - 1];
    } else {
      return;
    }

    event.preventDefault();
    // In automatic mode the focused tab selects itself (see handleFocus).
    target?.focus();
  }

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="tab"
      id={getTabId(baseId, value)}
      aria-selected={selected}
      aria-controls={getPanelId(baseId, value)}
      tabIndex={selected ? 0 : -1}
      className={cx(styles.tab, className)}
      data-selected={selected ? '' : undefined}
      data-orientation={orientation}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    />
  );
});
