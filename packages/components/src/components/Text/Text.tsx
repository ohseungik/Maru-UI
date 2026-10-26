import { forwardRef, type ComponentType, type HTMLAttributes, type RefAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Text.module.css';

export type TextElement = 'p' | 'span' | 'div' | 'small' | 'strong' | 'em';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextTone = 'default' | 'muted' | 'danger';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. Pick for meaning (`strong`, `em`), not for looks. */
  as?: TextElement;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
}

// The element is only known at runtime, so it is typed as one component that
// accepts the props every supported element shares (including a ref to HTMLElement).
type TextComponent = ComponentType<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>>;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as = 'p', size = 'md', tone = 'default', weight = 'regular', className, ...rest },
  ref,
) {
  const Component = as as unknown as TextComponent;

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(styles.root, className)}
      data-size={size}
      data-tone={tone}
      data-weight={weight}
    />
  );
});
