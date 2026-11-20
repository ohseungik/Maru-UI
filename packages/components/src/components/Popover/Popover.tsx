import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { computePosition, type Placement } from '../../utils/position';
import styles from './Popover.module.css';

// useLayoutEffect warns during server rendering in React 18; positioning only matters in the browser.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export type PopoverPlacement = Placement;

/** The props Popover adds to its trigger element. */
interface TriggerProps {
  onClick?: MouseEventHandler<Element>;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: 'dialog';
}

export interface PopoverProps {
  /** What the panel shows. Unlike a tooltip it may be interactive: links, buttons, fields. */
  content: ReactNode;
  /** The one element that opens the popover. It must be a focusable control, such as a button. */
  children: ReactElement<TriggerProps>;
  /** Visible heading of the panel. It is also the panel's accessible name. */
  title?: ReactNode;
  /** The panel's accessible name when there is no visible `title`. One of the two is required. */
  'aria-label'?: string;
  /** Preferred side. It flips to the opposite side when there is no room. */
  placement?: PopoverPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the next state when the user opens or dismisses the popover. */
  onOpenChange?: (open: boolean) => void;
  /** Render only the trigger. */
  disabled?: boolean;
  className?: string;
}

/**
 * A small non-modal panel that opens from a button and can hold interactive content.
 * It is the interactive sibling of Tooltip: a Tooltip is a hint on hover, a Popover is
 * something the user opens on purpose and works inside.
 *
 * The trigger gets `aria-expanded`, `aria-controls` and `aria-haspopup="dialog"`; the panel is
 * a `role="dialog"` that is not modal, so the rest of the page stays reachable.
 *
 * - Opening moves focus to the first control in the panel (or the panel itself).
 * - Esc closes it and returns focus to the trigger.
 * - Clicking outside, or moving focus out of it (for example with Tab), closes it.
 *
 * It is drawn in the browser's top layer with the Popover API, so no ancestor can clip it.
 * The trigger must render one DOM element, because the panel is positioned against it.
 */
export function Popover({
  content,
  children,
  title,
  'aria-label': ariaLabel,
  placement = 'bottom',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
}: PopoverProps) {
  const panelId = useId();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = !disabled && (controlled ? openProp : innerOpen);

  // The listeners below live as long as the popover is open, so they read the latest values
  // from here instead of closing over stale ones.
  const latest = useRef({ open, controlled, onOpenChange });
  useIsomorphicLayoutEffect(() => {
    latest.current = { open, controlled, onOpenChange };
  });

  const setOpen = (next: boolean) => {
    const { open: current, controlled: isControlled, onOpenChange: notify } = latest.current;
    if (next === current) return;
    if (!isControlled) setInnerOpen(next);
    notify?.(next);
  };

  // The panel is rendered right after its trigger, so the trigger is its previous sibling.
  const getTrigger = () => panelRef.current?.previousElementSibling ?? null;

  useIsomorphicLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !open) return;

    const place = () => {
      const trigger = getTrigger();
      if (!trigger) return;
      const { x, y, side } = computePosition(
        trigger.getBoundingClientRect(),
        { width: panel.offsetWidth, height: panel.offsetHeight },
        {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
        placement,
      );
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.dataset.placement = side;
    };

    // Without the Popover API the element still shows through the `data-open` style.
    let shown = false;
    if (typeof panel.showPopover === 'function') {
      panel.showPopover();
      shown = true;
    }
    place();

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && !panel.contains(target) && !getTrigger()?.contains(target);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // The popover is the topmost thing, so Esc dismisses it first and goes no further.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      const trigger = getTrigger();
      if (trigger instanceof HTMLElement) trigger.focus();
    };

    // The trigger is left out: its own click handler toggles, and closing here as well would
    // reopen the popover straight away.
    const onPointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) setOpen(false);
    };

    // Tab, or a script, moving focus somewhere else also dismisses it.
    const onFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) setOpen(false);
    };

    // Capture so scrolling inside any ancestor moves the panel with its trigger.
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);

    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
      if (shown) panel.hidePopover();
    };
  }, [open, placement]);

  // Move focus into the panel when it opens. A popover that starts open (defaultOpen, or a
  // controlled value that is already true) leaves focus alone so it does not steal it on load.
  const wasOpen = useRef(open);
  useEffect(() => {
    const panel = panelRef.current;
    if (open && !wasOpen.current && panel) {
      const target = panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      target.focus();
    }
    wasOpen.current = open;
  }, [open]);

  const trigger = Children.only(children);
  if (!isValidElement<TriggerProps>(trigger)) return <>{children}</>;
  if (disabled) return trigger;

  const own = trigger.props;
  const enhanced = cloneElement(trigger, {
    'aria-expanded': open,
    'aria-controls': panelId,
    'aria-haspopup': 'dialog',
    onClick: (event) => {
      own.onClick?.(event);
      if (event.defaultPrevented) return;
      setOpen(!latest.current.open);
    },
  });

  return (
    <>
      {enhanced}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        popover="manual"
        // The title names the panel when there is one, so aria-label is only a fallback.
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={cx(styles.root, className)}
        data-open={open ? '' : undefined}
        data-placement={placement}
      >
        {title ? (
          <div id={titleId} className={styles.title}>
            {title}
          </div>
        ) : null}
        {/* Only mounted while open: it starts fresh each time and hidden fields are not in the page. */}
        {open ? <div className={styles.body}>{content}</div> : null}
      </div>
    </>
  );
}
