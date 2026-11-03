import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Input } from '../Input';
import { Field } from './Field';

describe('Field', () => {
  it('names the control with its label', () => {
    render(
      <Field label="Email">
        <Input type="email" />
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeInTheDocument();

    // The label is wired to the control through htmlFor/id.
    expect(screen.getByLabelText('Email')).toBe(input);
  });

  it('describes the control with the description', () => {
    render(
      <Field label="Email" description="We never share it.">
        <Input />
      </Field>,
    );

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription(
      'We never share it.',
    );
  });

  it('marks the control invalid and describes it with the error', () => {
    render(
      <Field label="Email" description="We never share it." error="Enter a valid email">
        <Input />
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('We never share it. Enter a valid email');
  });

  it('is valid again when the error goes away', () => {
    const { rerender } = render(
      <Field label="Email" error="Enter a valid email">
        <Input />
      </Field>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');

    rerender(
      <Field label="Email">
        <Input />
      </Field>,
    );

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('treats an empty error as no error', () => {
    render(
      <Field label="Email" error="">
        <Input />
      </Field>,
    );

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('announces an error that appears later through a polite live region', () => {
    const { container, rerender } = render(
      <Field label="Email">
        <Input />
      </Field>,
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toBeEmptyDOMElement();

    rerender(
      <Field label="Email" error="Enter a valid email">
        <Input />
      </Field>,
    );

    // The same element is still mounted, which is what makes screen readers announce it.
    expect(container.querySelector('[aria-live="polite"]')).toBe(liveRegion);
    expect(liveRegion).toHaveTextContent('Enter a valid email');
  });

  it('keeps the visible asterisk out of the accessible name', () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('disables the control from the field', () => {
    render(
      <Field label="Email" disabled>
        <Input />
      </Field>,
    );

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  });

  it('keeps an aria-describedby set on the control', () => {
    render(
      <>
        <p id="extra">Extra hint</p>
        <Field label="Email" error="Enter a valid email">
          <Input aria-describedby="extra" />
        </Field>
      </>,
    );

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription(
      'Extra hint Enter a valid email',
    );
  });

  it('lets the control opt out of the invalid state explicitly', () => {
    render(
      <Field label="Email" error="Enter a valid email">
        <Input invalid={false} />
      </Field>,
    );

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('wires the label to the field id even if the control has its own id', () => {
    render(
      <Field label="Email">
        <Input id="custom" />
      </Field>,
    );

    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('id', 'custom');
  });

  it('keeps several fields independent', () => {
    render(
      <>
        <Field label="First name">
          <Input />
        </Field>
        <Field label="Last name" error="Required">
          <Input />
        </Field>
      </>,
    );

    const first = screen.getByRole('textbox', { name: 'First name' });
    const last = screen.getByRole('textbox', { name: 'Last name' });

    expect(first.id).not.toBe(last.id);
    expect(first).not.toHaveAttribute('aria-invalid');
    expect(last).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Field label="Email" description="We never share it." error="Enter a valid email" required>
        <Input type="email" />
      </Field>,
    );

    await expectNoA11yViolations(container);
  });
});
