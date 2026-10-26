import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Heading, type HeadingLevel } from './Heading';

describe('Heading', () => {
  it.each<HeadingLevel>([1, 2, 3, 4, 5, 6])('renders level %i as a heading element', (level) => {
    render(<Heading level={level}>Title</Heading>);
    expect(screen.getByRole('heading', { level, name: 'Title' })).toBeInTheDocument();
  });

  it('derives the visual size from the level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole('heading')).toHaveAttribute('data-size', '4xl');
  });

  it('lets size differ from level without changing the semantics', () => {
    render(
      <Heading level={2} size="md">
        Small h2
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('data-size', 'md');
  });

  it('applies tone', () => {
    render(
      <Heading level={3} tone="muted">
        Muted
      </Heading>,
    );
    expect(screen.getByRole('heading')).toHaveAttribute('data-tone', 'muted');
  });

  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading ref={ref} level={2} className="custom">
        Ref
      </Heading>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current).toHaveClass('custom');
  });

  it('has no accessibility violations for a logical outline', async () => {
    const { container } = render(
      <>
        <Heading level={1}>Page</Heading>
        <Heading level={2}>Section</Heading>
        <Heading level={3}>Subsection</Heading>
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
