import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a native checkbox named by its label', () => {
    render(<Checkbox>Accept the terms</Checkbox>);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept the terms' });
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).not.toBeChecked();
  });

  it('forwards its ref, as an object or a callback', () => {
    const objectRef = createRef<HTMLInputElement>();
    const callbackRef = vi.fn();

    render(
      <>
        <Checkbox ref={objectRef}>One</Checkbox>
        <Checkbox ref={callbackRef}>Two</Checkbox>
      </>,
    );

    expect(objectRef.current).toBe(screen.getByRole('checkbox', { name: 'One' }));
    expect(callbackRef).toHaveBeenCalledWith(screen.getByRole('checkbox', { name: 'Two' }));
  });

  it('toggles on click and reports the change', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Accept</Checkbox>);

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('is operable with the keyboard (Tab, Space)', async () => {
    const user = userEvent.setup();
    render(<Checkbox>Accept</Checkbox>);

    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();

    await user.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('supports defaultChecked and a controlled checked value', () => {
    const { rerender } = render(<Checkbox defaultChecked>Uncontrolled</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeChecked();

    rerender(
      <Checkbox checked={false} onChange={() => {}}>
        Controlled
      </Checkbox>,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    rerender(
      <Checkbox checked onChange={() => {}}>
        Controlled
      </Checkbox>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox disabled onChange={onChange}>
        Locked
      </Checkbox>,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the indeterminate state as partially checked', () => {
    const { rerender } = render(<Checkbox indeterminate>Select all</Checkbox>);

    const checkbox = screen.getByRole<HTMLInputElement>('checkbox');
    expect(checkbox).toBePartiallyChecked();
    expect(checkbox.indeterminate).toBe(true);

    rerender(<Checkbox indeterminate={false}>Select all</Checkbox>);
    expect(checkbox).not.toBePartiallyChecked();
    expect(checkbox.indeterminate).toBe(false);
  });

  it('marks itself invalid for assistive technology', () => {
    render(<Checkbox invalid>Accept</Checkbox>);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('data-invalid');
  });

  it('exposes size on the root and merges className', () => {
    const { container } = render(
      <Checkbox size="lg" className="extra">
        Accept
      </Checkbox>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root?.className).toContain('extra');
  });

  it('submits its value in a form', () => {
    const { container } = render(
      <form>
        <Checkbox name="terms" value="yes" defaultChecked>
          Accept
        </Checkbox>
      </form>,
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get('terms')).toBe('yes');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Checkbox>Accept the terms</Checkbox>
        <Checkbox indeterminate>Select all</Checkbox>
        <Checkbox invalid>Required</Checkbox>
        <Checkbox disabled>Locked</Checkbox>
        <Checkbox aria-label="No visible label" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
