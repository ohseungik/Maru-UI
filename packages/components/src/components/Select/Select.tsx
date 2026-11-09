import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/FieldContext';
import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  /**
   * Marks the value as invalid (`aria-invalid`). Inside a `Field` this follows the
   * field's `error` automatically, so you rarely need to set it yourself.
   */
  invalid?: boolean;
  /**
   * Text shown while nothing is chosen. It becomes a first, empty option the user cannot
   * pick again. Without it, the browser preselects the first option.
   */
  placeholder?: string;
  /** The `<option>` and `<optgroup>` elements. */
  children: ReactNode;
}

/**
 * A native `<select>` with the design system's look. The browser keeps doing what it does
 * best: the option list, keyboard search, mobile pickers and screen reader support. Inside a
 * `Field` it picks up the label, description, error, required and disabled state.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    invalid,
    placeholder,
    id,
    disabled,
    required,
    value,
    defaultValue,
    className,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();

  const isInvalid = invalid ?? field?.invalid ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined;

  // With a placeholder, an uncontrolled select must start on the empty option.
  const selection =
    value !== undefined
      ? { value }
      : { defaultValue: defaultValue ?? (placeholder !== undefined ? '' : undefined) };

  return (
    <span className={styles.wrapper} data-size={size} data-disabled={isDisabled ? '' : undefined}>
      <select
        {...rest}
        {...selection}
        ref={ref}
        // Inside a Field the label points at the field's id, so that id always wins.
        id={field?.controlId ?? id}
        className={cx(styles.root, className)}
        data-invalid={isInvalid ? '' : undefined}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={describedBy}
        disabled={isDisabled}
        required={required ?? field?.required}
      >
        {placeholder !== undefined ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
});
