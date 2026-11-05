import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { TabsContext, type TabsActivation, type TabsOrientation } from './TabsContext';
import styles from './Tabs.module.css';

interface TabsBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Called with the value of the tab the user selected. */
  onValueChange?: (value: string) => void;
  /** `vertical` lists the tabs in a column and uses the Up and Down arrow keys. */
  orientation?: TabsOrientation;
  /**
   * `automatic` selects a tab as soon as it receives focus with the arrow keys.
   * `manual` only moves focus; Enter or Space selects. Prefer `manual` when showing a
   * panel is slow, so keyboard users are not forced to wait on every arrow press.
   */
  activation?: TabsActivation;
  children: ReactNode;
}

/** Give either `value` (controlled) or `defaultValue` (uncontrolled), never both. */
export type TabsProps = TabsBaseProps &
  ({ value: string; defaultValue?: undefined } | { value?: undefined; defaultValue: string });

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    activation = 'automatic',
    className,
    children,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : innerValue;

  const select = useCallback(
    (next: string) => {
      if (next === value) return;
      if (!isControlled) setInnerValue(next);
      onValueChange?.(next);
    },
    [value, isControlled, onValueChange],
  );

  const context = useMemo(
    () => ({ baseId, value, select, orientation, activation }),
    [baseId, value, select, orientation, activation],
  );

  return (
    <TabsContext.Provider value={context}>
      <div
        {...rest}
        ref={ref}
        className={cx(styles.root, className)}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
