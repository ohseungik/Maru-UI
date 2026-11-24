import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './Table.module.css';

export type TableSort = 'ascending' | 'descending' | 'none';

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;
export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;
export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, ...rest },
  ref,
) {
  return <thead {...rest} ref={ref} className={cx(styles.head, className)} />;
});

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...rest },
  ref,
) {
  return <tbody {...rest} ref={ref} className={cx(styles.body, className)} />;
});

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, ...rest },
  ref,
) {
  return <tr {...rest} ref={ref} className={cx(styles.row, className)} />;
});

export interface TableHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'scope'> {
  /** `col` for a column heading (the default), `row` for the first cell of a row. */
  scope?: 'col' | 'row';
  /** Right-align numbers and use equal-width digits. */
  numeric?: boolean;
  /**
   * The current sort of this column. Set it on the sorted column and on the other sortable ones
   * (`none`); it is exposed as `aria-sort`. Leave it out for columns that cannot be sorted.
   */
  sort?: TableSort;
  /**
   * Makes the heading a button that asks for a new sort. The table does not sort anything itself:
   * change the rows and the `sort` prop in this handler.
   */
  onSort?: () => void;
}

export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(function TableHeader(
  { scope = 'col', numeric = false, sort, onSort, className, children, ...rest },
  ref,
) {
  return (
    <th
      {...rest}
      ref={ref}
      scope={scope}
      aria-sort={sort}
      className={cx(styles.header, className)}
      data-numeric={numeric ? '' : undefined}
    >
      {onSort ? (
        <button type="button" className={styles.sort} onClick={onSort} data-sort={sort}>
          {children}
          <span className={styles.sortIcon} aria-hidden="true" />
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Right-align numbers and use equal-width digits. */
  numeric?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric = false, className, ...rest },
  ref,
) {
  return (
    <td
      {...rest}
      ref={ref}
      className={cx(styles.cell, className)}
      data-numeric={numeric ? '' : undefined}
    />
  );
});
