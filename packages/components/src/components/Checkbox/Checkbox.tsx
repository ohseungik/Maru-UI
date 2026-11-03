import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /** The visible label. Without it, set `aria-label` or `aria-labelledby`. */
  children?: ReactNode;
  size?: CheckboxSize;
  /**
   * Shows the "some selected" state of a parent checkbox. It is purely visual and
   * announced as "mixed"; the browser clears it when the user clicks, so a controlled
   * parent should recompute it in `onChange`.
   */
  indeterminate?: boolean;
  /** Marks the value as invalid (`aria-invalid`), for example a required checkbox left unchecked. */
  invalid?: boolean;
}

/** A native checkbox with a custom box. Click, Space, label click and forms all work natively. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { size = 'md', indeterminate = false, invalid = false, disabled, className, children, ...rest },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  // `indeterminate` is a DOM property with no HTML attribute, so it is set after render.
  // It runs on every render because a user click resets it in the browser.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  });

  return (
    <label
      className={cx(styles.root, className)}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
    >
      <span className={styles.control}>
        <input
          {...rest}
          ref={setRefs}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          data-invalid={invalid ? '' : undefined}
          aria-invalid={invalid ? true : undefined}
        />
        <span className={styles.box} aria-hidden="true" />
      </span>
      {children ? <span className={styles.label}>{children}</span> : null}
    </label>
  );
});
