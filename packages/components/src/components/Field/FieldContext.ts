import { createContext, useContext } from 'react';

export interface FieldContextValue {
  /** The id the field's label points to. The control inside the field must use it. */
  controlId: string;
  /** Space-separated ids of the description and error, for `aria-describedby`. */
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/** Returns the surrounding Field's wiring, or `null` when used outside a Field. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}
