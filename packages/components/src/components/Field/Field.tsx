import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { FieldContext } from './FieldContext';
import styles from './Field.module.css';

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible label. Always required: a control without a name is not accessible. */
  label: ReactNode;
  /** Help text shown under the label and read after it by screen readers. */
  description?: ReactNode;
  /** Error message. Its presence marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** The control, for example an `Input`. */
  children: ReactNode;
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== '';
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, description, error, required = false, disabled = false, className, children, ...rest },
  ref,
) {
  const baseId = useId();
  const controlId = `${baseId}-control`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const hasDescription = hasContent(description);
  const hasError = hasContent(error);
  const describedBy =
    [hasDescription ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.root, className)}
      data-invalid={hasError ? '' : undefined}
    >
      <label htmlFor={controlId} className={styles.label}>
        {label}
        {required ? (
          <span aria-hidden="true" className={styles.required}>
            {' *'}
          </span>
        ) : null}
      </label>
      {hasDescription ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
      <FieldContext.Provider
        value={{ controlId, describedBy, invalid: hasError, required, disabled }}
      >
        {children}
      </FieldContext.Provider>
      {/* The live region stays mounted so a newly added error is announced. */}
      <div aria-live="polite">
        {hasError ? (
          <p id={errorId} className={styles.error}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
});
