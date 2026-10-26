import { forwardRef, type ComponentType, type HTMLAttributes, type RefAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type HeadingTone = 'default' | 'muted';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (h1-h6). Decides document structure, not appearance. */
  level: HeadingLevel;
  /** Visual size. Defaults to the size that matches `level`. */
  size?: HeadingSize;
  tone?: HeadingTone;
}

const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
};

// The tag (h1-h6) is only known at runtime, so it is typed as one component that
// accepts the props every heading shares (including a ref to HTMLHeadingElement).
type HeadingComponent = ComponentType<
  HTMLAttributes<HTMLHeadingElement> & RefAttributes<HTMLHeadingElement>
>;

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level, size, tone = 'default', className, ...rest },
  ref,
) {
  const Component = `h${level}` as unknown as HeadingComponent;

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(styles.root, className)}
      data-size={size ?? DEFAULT_SIZE[level]}
      data-tone={tone}
    />
  );
});
