import {
  forwardRef,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type RefAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './Stack.module.css';

/** Keys of `scale.space` in @ohseungik/maru-tokens. A test keeps both in sync. */
export const STACK_GAPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] as const;

export type StackGap = (typeof STACK_GAPS)[number];
export type StackElement =
  'div' | 'section' | 'nav' | 'header' | 'footer' | 'main' | 'article' | 'aside';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: StackElement;
  direction?: 'vertical' | 'horizontal';
  /** Space between children, as a key of the spacing scale. */
  gap?: StackGap;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Allow children to wrap onto multiple lines. */
  wrap?: boolean;
}

// The element is only known at runtime, so it is typed as one component that
// accepts the props every supported element shares (including a ref to HTMLElement).
type StackComponent = ComponentType<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>>;

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    as = 'div',
    direction = 'vertical',
    gap = 4,
    align,
    justify,
    wrap = false,
    className,
    style,
    ...rest
  },
  ref,
) {
  const Component = as as unknown as StackComponent;
  const mergedStyle = {
    '--maru-stack-gap': `var(--maru-space-${gap})`,
    ...style,
  } as CSSProperties;

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(styles.root, className)}
      style={mergedStyle}
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? '' : undefined}
    />
  );
});
