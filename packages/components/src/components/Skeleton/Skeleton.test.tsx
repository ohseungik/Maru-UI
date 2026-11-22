import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Skeleton } from './index';

const setup = (props: Parameters<typeof Skeleton>[0] = {}) => {
  const { container } = render(<Skeleton {...props} />);
  return { container, el: container.firstElementChild as HTMLElement };
};

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { el } = setup();
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('is a text line by default', () => {
    const { el } = setup();
    expect(el).toHaveAttribute('data-variant', 'text');
    expect(el).not.toHaveAttribute('data-lines');
    expect(el.children).toHaveLength(0);
  });

  it.each(['text', 'rect', 'circle'] as const)('renders the %s variant', (variant) => {
    const { el } = setup({ variant });
    expect(el).toHaveAttribute('data-variant', variant);
  });

  it('reads numbers as pixels and passes strings through', () => {
    const { el } = setup({ width: 120, height: '3rem' });
    expect(el.style.getPropertyValue('--maru-skeleton-width')).toBe('120px');
    expect(el.style.getPropertyValue('--maru-skeleton-height')).toBe('3rem');
  });

  it('draws several lines for text', () => {
    const { el } = setup({ lines: 3 });
    expect(el).toHaveAttribute('data-lines', '3');
    expect(el.children).toHaveLength(3);
  });

  it('ignores `lines` on shapes that are not text', () => {
    const { el } = setup({ variant: 'rect', lines: 4 });
    expect(el.children).toHaveLength(0);
    expect(el).not.toHaveAttribute('data-lines');
  });

  it.each([0, -2, Number.NaN])('treats lines=%s as one line', (lines) => {
    const { el } = setup({ lines });
    expect(el.children).toHaveLength(0);
  });

  it('keeps the caller class, style and ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Skeleton ref={ref} className="extra" style={{ marginTop: 4 }} data-testid="s" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(ref.current).toBe(el);
    expect(el).toHaveClass('extra');
    expect(el.style.marginTop).toBe('4px');
    expect(el).toHaveAttribute('data-testid', 's');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton variant="circle" />
        <Skeleton lines={3} />
        <Skeleton variant="rect" height={80} />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
