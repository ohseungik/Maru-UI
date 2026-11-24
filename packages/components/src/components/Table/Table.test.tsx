import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
  type TableSort,
} from './index';

function Example(props: Partial<TableProps> & { sort?: TableSort; onSort?: () => void }) {
  const { sort, onSort, ...table } = props;
  return (
    <Table caption="Team" {...table}>
      <TableHead>
        <TableRow>
          <TableHeader sort={sort} onSort={onSort}>
            Name
          </TableHeader>
          <TableHeader numeric>Score</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeader scope="row">Ada</TableHeader>
          <TableCell numeric>42</TableCell>
        </TableRow>
        <TableRow>
          <TableHeader scope="row">Linus</TableHeader>
          <TableCell numeric>7</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// jsdom does no layout, so overflow is simulated by what the component reads.
function mockOverflow(scrollWidth: number, clientWidth: number) {
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth);
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Table', () => {
  it('renders native table semantics, named by its caption', () => {
    render(<Example />);

    const table = screen.getByRole('table', { name: 'Team' });
    expect(table.querySelector('caption')).toHaveTextContent('Team');
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
      'Ada',
      'Linus',
    ]);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  it('marks column and row headings with their scope', () => {
    render(<Example />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('rowheader', { name: 'Ada' })).toHaveAttribute('scope', 'row');
  });

  it('can be named with aria-label instead of a caption', () => {
    render(<Example caption={undefined} aria-label="Scores" />);

    expect(screen.getByRole('table', { name: 'Scores' })).toBeInTheDocument();
    expect(document.querySelector('caption')).toBeNull();
  });

  it('keeps a hidden caption in the DOM for assistive technology', () => {
    render(<Example hideCaption />);

    expect(screen.getByRole('table', { name: 'Team' })).toBeInTheDocument();
    expect(document.querySelector('caption')).toHaveAttribute('data-hidden');
  });

  it('exposes size, striping and numeric alignment as data attributes', () => {
    render(<Example size="sm" striped />);

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-size', 'sm');
    expect(table).toHaveAttribute('data-striped');
    expect(screen.getByRole('columnheader', { name: 'Score' })).toHaveAttribute('data-numeric');
    expect(screen.getAllByRole('cell')[0]).toHaveAttribute('data-numeric');
  });

  it('keeps className and ref on the table element', () => {
    render(<Example className="extra" data-testid="t" />);

    expect(screen.getByTestId('t')).toHaveClass('extra');
    expect(screen.getByTestId('t').tagName).toBe('TABLE');
  });

  describe('sorting', () => {
    it.each<TableSort>(['ascending', 'descending', 'none'])('exposes aria-sort=%s', (sort) => {
      render(<Example sort={sort} onSort={() => {}} />);

      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', sort);
    });

    it('leaves aria-sort off columns that cannot be sorted', () => {
      render(<Example sort="ascending" onSort={() => {}} />);

      expect(screen.getByRole('columnheader', { name: 'Score' })).not.toHaveAttribute('aria-sort');
    });

    it('turns the heading into a button that asks for a sort', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render(<Example sort="none" onSort={onSort} />);

      await user.click(screen.getByRole('button', { name: 'Name' }));
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onSort).toHaveBeenCalledTimes(3);
    });

    it('adds no button when the column is not sortable', () => {
      render(<Example />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('horizontal scrolling', () => {
    it('is a plain wrapper, with no extra Tab stop, while the table fits', () => {
      mockOverflow(300, 300);
      render(<Example />);

      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(document.querySelector('[tabindex]')).toBeNull();
    });

    it('becomes a focusable region named by the caption while it overflows', () => {
      mockOverflow(900, 300);
      render(<Example />);

      const region = screen.getByRole('region', { name: 'Team' });
      expect(region).toHaveAttribute('tabindex', '0');
      expect(region).toContainElement(screen.getByRole('table'));
    });

    it('falls back to aria-label for the region when there is no caption', () => {
      mockOverflow(900, 300);
      render(<Example caption={undefined} aria-label="Scores" />);

      expect(screen.getByRole('region', { name: 'Scores' })).toBeInTheDocument();
    });

    it('can be reached with the keyboard', async () => {
      const user = userEvent.setup();
      mockOverflow(900, 300);
      render(<Example />);

      await user.tab();

      expect(screen.getByRole('region', { name: 'Team' })).toHaveFocus();
    });

    it('reacts when the size changes', () => {
      type Callback = () => void;
      const callbacks: Callback[] = [];
      class FakeObserver {
        constructor(callback: Callback) {
          callbacks.push(callback);
        }
        observe() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', FakeObserver);
      mockOverflow(300, 300);
      render(<Example />);
      expect(screen.queryByRole('region')).not.toBeInTheDocument();

      vi.restoreAllMocks();
      mockOverflow(900, 300);
      act(() => callbacks.forEach((callback) => callback()));

      expect(screen.getByRole('region', { name: 'Team' })).toBeInTheDocument();
      vi.unstubAllGlobals();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Example sort="ascending" onSort={() => {}} striped />);
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations while it scrolls', async () => {
    mockOverflow(900, 300);
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);
  });
});
