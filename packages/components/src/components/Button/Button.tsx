import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual emphasis. Use one `primary` per view. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Shows a spinner and marks the button busy. The button is also disabled while
   * loading so it cannot be activated twice.
   */
  loading?: boolean;
  /** Defaults to `button` so a Button inside a form never submits by accident. */
  type?: 'button' | 'submit' | 'reset';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    type = 'button',
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? '' : undefined}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
