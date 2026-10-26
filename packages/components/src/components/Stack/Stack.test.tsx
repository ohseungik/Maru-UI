import { render, screen } from '@testing-library/react';
import { createRef, type CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import tokens from '../../../../tokens/src/tokens.json';
import { expectNoA11yViolations } from '../../test/a11y';
import { STACK_GAPS, Stack } from './Stack';

describe('Stack', () => {
  it('renders a vertical div with the default gap', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const stack = screen.getByTestId('stack');

    expect(stack.tagName).toBe('DIV');
    expect(stack).toHaveAttribute('data-direction', 'vertical');
    expect(stack.style.getPropertyValue('--maru-stack-gap')).toBe('var(--maru-space-4)');
  });

  it('maps gap to a spacing token', () => {
    render(
      <Stack data-testid="stack" gap={6}>
        content
      </Stack>,
    );
    expect(screen.getByTestId('stack').style.getPropertyValue('--maru-stack-gap')).toBe(
      'var(--maru-space-6)',
    );
  });

  it('supports gap={0}', () => {
    render(
      <Stack data-testid="stack" gap={0}>
        content
      </Stack>,
    );
    expect(screen.getByTestId('stack').style.getPropertyValue('--maru-stack-gap')).toBe(
      'var(--maru-space-0)',
    );
  });

  it('exposes direction, alignment, justification and wrapping as data attributes', () => {
    render(
      <Stack data-testid="stack" direction="horizontal" align="center" justify="between" wrap>
        content
      </Stack>,
    );
    const stack = screen.getByTestId('stack');

    expect(stack).toHaveAttribute('data-direction', 'horizontal');
    expect(stack).toHaveAttribute('data-align', 'center');
    expect(stack).toHaveAttribute('data-justify', 'between');
    expect(stack).toHaveAttribute('data-wrap');
  });

  it('does not set wrap, align or justify unless asked', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const stack = screen.getByTestId('stack');

    expect(stack).not.toHaveAttribute('data-wrap');
    expect(stack).not.toHaveAttribute('data-align');
    expect(stack).not.toHaveAttribute('data-justify');
  });

  it('renders the element chosen with `as`', () => {
    render(
      <Stack as="nav" aria-label="Main">
        content
      </Stack>,
    );
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('merges custom style and className, and lets style override the gap', () => {
    render(
      <Stack
        data-testid="stack"
        className="custom"
        style={{ color: 'red', '--maru-stack-gap': '10px' } as CSSProperties}
      >
        content
      </Stack>,
    );
    const stack = screen.getByTestId('stack');

    expect(stack).toHaveClass('custom');
    expect(stack.style.color).toBe('red');
    expect(stack.style.getPropertyValue('--maru-stack-gap')).toBe('10px');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Stack ref={ref}>content</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('only allows gaps that exist in the token scale', () => {
    expect(STACK_GAPS.map(String)).toEqual(Object.keys(tokens.scale.space));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Stack as="section" aria-label="Group">
        <p>One</p>
        <p>Two</p>
      </Stack>,
    );
    await expectNoA11yViolations(container);
  });
});
