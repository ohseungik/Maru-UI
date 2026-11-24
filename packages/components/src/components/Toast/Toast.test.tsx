import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { ToastProvider, useToast, type ToastApi, type ToastProviderProps } from './index';

// Hands the hook's API to the test, so toasts can be raised from outside React's event handlers.
function setup(props: Partial<ToastProviderProps> = {}) {
  const holder: { api: ToastApi | null } = { api: null };
  function Capture() {
    holder.api = useToast();
    return null;
  }
  const result = render(
    <ToastProvider {...props}>
      <Capture />
      <button type="button">Page</button>
    </ToastProvider>,
  );
  const api = () => holder.api as ToastApi;
  const toast: ToastApi['toast'] = (options) => {
    let id = '';
    act(() => {
      id = api().toast(options);
    });
    return id;
  };
  const dismiss: ToastApi['dismiss'] = (id) => act(() => api().dismiss(id));
  return { ...result, toast, dismiss };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Toast', () => {
  it('throws a helpful error when the hook is used without a provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Broken() {
      useToast();
      return null;
    }
    expect(() => render(<Broken />)).toThrow(/ToastProvider/);
    error.mockRestore();
  });

  it('has its two live regions in the page before any toast, empty', () => {
    setup();

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('announces a neutral toast politely and an error right away', () => {
    const { toast } = setup({ duration: 0 });

    toast({ title: 'Saved' });
    toast({ title: 'Upload failed', description: 'Try again.', tone: 'danger' });

    expect(within(screen.getByRole('status')).getByText('Saved')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Upload failed')).toBeInTheDocument();
    expect(within(alert).getByText('Try again.')).toBeInTheDocument();
  });

  it('returns an id for every toast', () => {
    const { toast } = setup({ duration: 0 });

    const first = toast({ title: 'One' });
    const second = toast({ title: 'Two' });

    expect(first).not.toBe(second);
  });

  it('closes by itself after its duration', async () => {
    const { toast } = setup();
    toast({ title: 'Saved', duration: 60 });
    expect(screen.getByText('Saved')).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument());
  });

  it('uses the provider duration by default', async () => {
    const { toast } = setup({ duration: 60 });
    toast({ title: 'Saved' });

    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument());
  });

  it('stays until dismissed when the duration is 0', async () => {
    const { toast } = setup();
    toast({ title: 'Stay', duration: 0 });

    await act(() => sleep(150));

    expect(screen.getByText('Stay')).toBeInTheDocument();
  });

  it('keeps a toast with an action open, so there is time to use it', async () => {
    const { toast } = setup({ duration: 40 });
    toast({ title: 'Deleted', action: { label: 'Undo', onClick: () => {} } });

    await act(() => sleep(150));

    expect(screen.getByText('Deleted')).toBeInTheDocument();
  });

  it('runs the action, then closes the toast', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { toast } = setup();
    toast({ title: 'Deleted', action: { label: 'Undo', onClick } });

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Deleted')).not.toBeInTheDocument();
  });

  it('closes with its close button, which has an accessible name', async () => {
    const user = userEvent.setup();
    const { toast } = setup({ duration: 0 });
    toast({ title: 'Saved' });

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('names the close button with `closeLabel`', () => {
    const { toast } = setup({ duration: 0, closeLabel: '닫기' });
    toast({ title: 'Saved' });

    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('closes the focused toast with Esc and leaves the others', async () => {
    const user = userEvent.setup();
    const { toast } = setup({ duration: 0 });
    toast({ title: 'First' });
    toast({ title: 'Second' });
    const [firstClose] = screen.getAllByRole('button', { name: 'Dismiss' });
    firstClose?.focus();

    await user.keyboard('{Escape}');

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('does not touch Esc when focus is not in a toast', async () => {
    const user = userEvent.setup();
    const { toast } = setup({ duration: 0 });
    toast({ title: 'Saved' });

    await user.click(screen.getByRole('button', { name: 'Page' }));
    await user.keyboard('{Escape}');

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('pauses while the pointer is over the toasts, then carries on', async () => {
    const user = userEvent.setup();
    const { toast } = setup();
    toast({ title: 'Saved', duration: 120 });

    await user.hover(screen.getByText('Saved'));
    await act(() => sleep(250));
    expect(screen.getByText('Saved')).toBeInTheDocument();

    await user.unhover(screen.getByText('Saved'));
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument());
  });

  it('pauses while focus is inside the toasts', async () => {
    const user = userEvent.setup();
    const { toast } = setup();
    toast({ title: 'Saved', duration: 120 });
    screen.getByRole('button', { name: 'Dismiss' }).focus();

    await act(() => sleep(250));
    expect(screen.getByText('Saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Page' }));
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument());
  });

  it('drops the oldest toast past the limit', () => {
    const { toast } = setup({ duration: 0, limit: 2 });

    toast({ title: 'One' });
    toast({ title: 'Two' });
    toast({ title: 'Three' });

    expect(screen.queryByText('One')).not.toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });

  it('dismisses one toast by id, or all of them', () => {
    const { toast, dismiss } = setup({ duration: 0 });
    const first = toast({ title: 'One' });
    toast({ title: 'Two' });

    dismiss(first);
    expect(screen.queryByText('One')).not.toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();

    dismiss();
    expect(screen.queryByText('Two')).not.toBeInTheDocument();
  });

  it('places the stack in a corner', () => {
    const { container } = setup({ placement: 'top-start' });

    expect(container.querySelector('[data-placement="top-start"]')).toBeInTheDocument();
  });

  it('has no accessibility violations, empty or with toasts', async () => {
    const { container, toast } = setup({ duration: 0 });
    await expectNoA11yViolations(container);

    toast({ title: 'Saved', description: 'All changes are stored.' });
    toast({ title: 'Failed', tone: 'danger', action: { label: 'Retry', onClick: () => {} } });
    await expectNoA11yViolations(container);
  });
});
