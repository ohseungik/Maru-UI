import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The shape: a line of text, a block, or a circle (an avatar). Defaults to `text`.
   */
  variant?: SkeletonVariant;
  /** A number is read as pixels; a string is any CSS length. */
  width?: number | string;
  /** A number is read as pixels; a string is any CSS length. Ignored by `text`, which follows the line height. */
  height?: number | string;
  /** For `text`: how many lines to draw. The last one is shorter, like the end of a paragraph. */
  lines?: number;
}

function toLength(value: number | string | undefined): string | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A placeholder for content that is still loading. It is decorative: it is hidden from assistive
 * technology, so say that something is loading on the region instead (`aria-busy` and a status
 * message), not on the placeholder.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, className, style, ...rest },
  ref,
) {
  const count = variant === 'text' ? Math.max(1, Math.floor(lines) || 1) : 1;
  const mergedStyle = {
    '--maru-skeleton-width': toLength(width),
    '--maru-skeleton-height': toLength(height),
    ...style,
  } as CSSProperties;

  return (
    <div
      {...rest}
      ref={ref}
      aria-hidden="true"
      className={cx(styles.root, className)}
      style={mergedStyle}
      data-variant={variant}
      data-lines={count > 1 ? count : undefined}
    >
      {count > 1 ? Array.from({ length: count }, (_, index) => <span key={index} />) : null}
    </div>
  );
});
