import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Switch.module.css';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** The visible label. Without it, set `aria-label` or `aria-labelledby`. */
  children?: ReactNode;
  size?: SwitchSize;
}

/**
 * An on/off setting that takes effect immediately, like a light switch. It is a native
 * checkbox with `role="switch"`, so Space toggles it and it works in forms. For choices
 * that are only applied after a submit, use `Checkbox` instead.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = 'md', disabled, className, children, ...rest },
  ref,
) {
  return (
    <label
      className={cx(styles.root, className)}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
    >
      <span className={styles.control}>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          className={styles.input}
          disabled={disabled}
        />
        <span className={styles.track} aria-hidden="true" />
      </span>
      {children ? <span className={styles.label}>{children}</span> : null}
    </label>
  );
});
