import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type TableHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './Table.module.css';

export type TableSize = 'sm' | 'md';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * What the table is about. It is a native `<caption>`, so it names the table for assistive
   * technology. Give the table either a caption or an `aria-label`.
   */
  caption?: ReactNode;
  /** Keep the caption for assistive technology only. */
  hideCaption?: boolean;
  size?: TableSize;
  /** Shade every other row. */
  striped?: boolean;
}

/**
 * A data table on the native `<table>` elements, inside a wrapper that scrolls sideways when the
 * table is wider than its container. A scroll area is only reachable by keyboard when it can take
 * focus, so the wrapper becomes a focusable, named region exactly while it overflows and is a
 * plain element otherwise (no extra Tab stop).
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { caption, hideCaption = false, size = 'md', striped = false, className, children, ...rest },
  ref,
) {
  const captionId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measure = () => setScrollable(wrapper.scrollWidth > wrapper.clientWidth);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    if (wrapper.firstElementChild) observer.observe(wrapper.firstElementChild);
    return () => observer.disconnect();
  }, []);

  const hasCaption = caption !== undefined && caption !== null && caption !== false;
  const label = rest['aria-label'];

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      // Only while it scrolls: a focusable, named region, so the keyboard can reach the overflow.
      {...(scrollable
        ? {
            role: 'region',
            tabIndex: 0,
            'aria-labelledby': hasCaption ? captionId : undefined,
            'aria-label': hasCaption ? undefined : label,
          }
        : null)}
    >
      <table
        {...rest}
        ref={ref}
        className={cx(styles.root, className)}
        data-size={size}
        data-striped={striped ? '' : undefined}
      >
        {hasCaption ? (
          <caption
            id={captionId}
            className={styles.caption}
            data-hidden={hideCaption ? '' : undefined}
          >
            {caption}
          </caption>
        ) : null}
        {children}
      </table>
    </div>
  );
});
