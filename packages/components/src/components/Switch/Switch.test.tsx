import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders a switch named by its label', () => {
    render(<Switch>Notifications</Switch>);

    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control.tagName).toBe('INPUT');
    expect(control).not.toBeChecked();
  });

  it('forwards its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref}>Notifications</Switch>);

    expect(ref.current).toBe(screen.getByRole('switch'));
  });

  it('turns on and off with a click and reports the change', async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>Notifications</Switch>);

    const control = screen.getByRole('switch');
    await userEvent.click(control);
    expect(control).toBeChecked();

    await userEvent.click(control);
    expect(control).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('is operable with the keyboard (Tab, Space)', async () => {
    const user = userEvent.setup();
    render(<Switch>Notifications</Switch>);

    await user.tab();
    expect(screen.getByRole('switch')).toHaveFocus();

    await user.keyboard(' ');
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('supports defaultChecked and a controlled checked value', () => {
    const { rerender } = render(<Switch defaultChecked>Uncontrolled</Switch>);
    expect(screen.getByRole('switch')).toBeChecked();

    rerender(
      <Switch checked={false} onChange={() => {}}>
        Controlled
      </Switch>,
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    render(
      <Switch disabled onChange={onChange}>
        Locked
      </Switch>,
    );

    const control = screen.getByRole('switch');
    expect(control).toBeDisabled();

    await userEvent.click(control);
    expect(control).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('exposes size on the root and merges className', () => {
    const { container } = render(
      <Switch size="sm" className="extra">
        Notifications
      </Switch>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root?.className).toContain('extra');
  });

  it('submits its value in a form', () => {
    const { container } = render(
      <form>
        <Switch name="notify" value="on" defaultChecked>
          Notifications
        </Switch>
      </form>,
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get('notify')).toBe('on');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Switch>Notifications</Switch>
        <Switch defaultChecked>Dark mode</Switch>
        <Switch disabled>Locked</Switch>
        <Switch aria-label="No visible label" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
