import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/FieldContext';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  /**
   * Marks the value as invalid (`aria-invalid`). Inside a `Field` this follows the
   * field's `error` automatically, so you rarely need to set it yourself.
   */
  invalid?: boolean;
}

/**
 * A native text input. Inside a `Field` it picks up the label, description, error,
 * required and disabled state from the field; on its own it needs an `aria-label`
 * or an external `<label>`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    type = 'text',
    invalid,
    id,
    disabled,
    required,
    className,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();

  const isInvalid = invalid ?? field?.invalid ?? false;
  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined;

  return (
    <input
      {...rest}
      ref={ref}
      // Inside a Field the label points at the field's id, so that id always wins.
      id={field?.controlId ?? id}
      type={type}
      className={cx(styles.root, className)}
      data-size={size}
      data-invalid={isInvalid ? '' : undefined}
      aria-invalid={isInvalid ? true : undefined}
      aria-describedby={describedBy}
      disabled={disabled ?? field?.disabled}
      required={required ?? field?.required}
    />
  );
});
