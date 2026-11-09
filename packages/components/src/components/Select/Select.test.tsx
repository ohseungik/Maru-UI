import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Field } from '../Field';
import { Select } from './Select';

function Options() {
  return (
    <>
      <option value="seoul">Seoul</option>
      <option value="busan">Busan</option>
      <option value="jeju">Jeju</option>
    </>
  );
}

describe('Select', () => {
  it('renders a native select and forwards its ref', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="City">
        <Options />
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'City' });
    expect(select.tagName).toBe('SELECT');
    expect(ref.current).toBe(select);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('defaults to md size and a valid state', () => {
    render(
      <Select aria-label="City">
        <Options />
      </Select>,
    );

    const select = screen.getByRole('combobox');
    expect(select.parentElement).toHaveAttribute('data-size', 'md');
    expect(select).not.toHaveAttribute('aria-invalid');
    expect(select).not.toHaveAttribute('data-invalid');
  });

  it('selects the first option by default and reports changes', async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="City" onChange={onChange}>
        <Options />
      </Select>,
    );
    const select = screen.getByRole<HTMLSelectElement>('combobox');
    expect(select.value).toBe('seoul');

    await userEvent.selectOptions(select, 'busan');
    expect(select.value).toBe('busan');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports defaultValue and a controlled value', () => {
    const { rerender } = render(
      <Select aria-label="City" defaultValue="jeju">
        <Options />
      </Select>,
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('jeju');

    rerender(
      <Select aria-label="City" value="busan" onChange={() => {}}>
        <Options />
      </Select>,
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('busan');
  });

  describe('placeholder', () => {
    it('starts on an empty, unpickable placeholder option', async () => {
      render(
        <Select aria-label="City" placeholder="Choose a city">
          <Options />
        </Select>,
      );
      const select = screen.getByRole<HTMLSelectElement>('combobox');
      expect(select.value).toBe('');
      expect(select).toHaveDisplayValue('Choose a city');

      // A `hidden` option has no accessible name, so find it by its text instead of its role.
      const placeholder = screen.getByText('Choose a city');
      expect(placeholder.tagName).toBe('OPTION');
      expect(placeholder).toBeDisabled();

      await userEvent.selectOptions(select, 'jeju');
      expect(select.value).toBe('jeju');
    });

    it('lets a defaultValue or a value win over the placeholder', () => {
      const { rerender } = render(
        <Select aria-label="City" placeholder="Choose" defaultValue="busan">
          <Options />
        </Select>,
      );
      expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('busan');

      rerender(
        <Select aria-label="City" placeholder="Choose" value="" onChange={() => {}}>
          <Options />
        </Select>,
      );
      expect(screen.getByRole<HTMLSelectElement>('combobox')).toHaveDisplayValue('Choose');
    });

    it('does not add an option when there is no placeholder', () => {
      render(
        <Select aria-label="City">
          <Options />
        </Select>,
      );
      expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(3);
    });
  });

  it('applies size and invalid', () => {
    render(
      <Select aria-label="City" size="lg" invalid>
        <Options />
      </Select>,
    );
    const select = screen.getByRole('combobox');
    expect(select.parentElement).toHaveAttribute('data-size', 'lg');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toBeInvalid();
  });

  it('can be disabled', async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="City" disabled onChange={onChange}>
        <Options />
      </Select>,
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    await userEvent.selectOptions(select, 'busan').catch(() => {});
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the decorative chevron from assistive tech', () => {
    const { container } = render(
      <Select aria-label="City">
        <Options />
      </Select>,
    );
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  describe('inside a Field', () => {
    it('is labelled, described and invalid from the field', () => {
      render(
        <Field label="City" description="Where you live." error="Pick a city.">
          <Select placeholder="Choose">
            <Options />
          </Select>
        </Field>,
      );
      const select = screen.getByRole('combobox', { name: 'City' });
      expect(select).toHaveAccessibleDescription('Where you live. Pick a city.');
      expect(select).toBeInvalid();
    });

    it('takes required and disabled from the field', () => {
      render(
        <Field label="City" required disabled>
          <Select>
            <Options />
          </Select>
        </Field>,
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
      expect(select).toBeDisabled();
    });

    it('lets its own props override the field', () => {
      render(
        <Field label="City" disabled>
          <Select disabled={false} invalid>
            <Options />
          </Select>
        </Field>,
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeEnabled();
      expect(select).toBeInvalid();
    });

    it('keeps the extra aria-describedby next to the field ones', () => {
      render(
        <Field label="City" description="Where you live.">
          <Select aria-describedby="extra">
            <Options />
          </Select>
        </Field>,
      );
      const ids = screen.getByRole('combobox').getAttribute('aria-describedby')?.split(' ');
      expect(ids).toHaveLength(2);
      expect(ids?.[0]).toBe('extra');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Field label="City" description="Where you live." required>
        <Select placeholder="Choose a city">
          <optgroup label="Korea">
            <Options />
          </optgroup>
        </Select>
      </Field>,
    );
    await expectNoA11yViolations(container);
  });
});
