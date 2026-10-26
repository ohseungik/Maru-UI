import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Text } from './Text';

describe('Text', () => {
  it('renders a paragraph by default', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello').tagName).toBe('P');
  });

  it('renders the element chosen with `as`', () => {
    render(
      <Text as="strong" data-testid="text">
        Important
      </Text>,
    );
    expect(screen.getByTestId('text').tagName).toBe('STRONG');
  });

  it('has default size, tone and weight', () => {
    render(<Text data-testid="text">Default</Text>);
    const element = screen.getByTestId('text');
    expect(element).toHaveAttribute('data-size', 'md');
    expect(element).toHaveAttribute('data-tone', 'default');
    expect(element).toHaveAttribute('data-weight', 'regular');
  });

  it('applies size, tone and weight', () => {
    render(
      <Text data-testid="text" size="sm" tone="danger" weight="bold">
        Error
      </Text>,
    );
    const element = screen.getByTestId('text');
    expect(element).toHaveAttribute('data-size', 'sm');
    expect(element).toHaveAttribute('data-tone', 'danger');
    expect(element).toHaveAttribute('data-weight', 'bold');
  });

  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text ref={ref} className="custom">
        Ref
      </Text>,
    );
    expect(ref.current).toHaveClass('custom');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <Text>Paragraph</Text>
        <Text as="span" tone="muted">
          Muted
        </Text>
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
