import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { computePosition, type TooltipPlacement } from './position';
import styles from './Tooltip.module.css';

// useLayoutEffect warns during server rendering in React 18; positioning only matters in the browser.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

/** The props Tooltip adds to its trigger element. */
interface TriggerProps {
  onMouseEnter?: MouseEventHandler<Element>;
  onMouseLeave?: MouseEventHandler<Element>;
  onFocus?: FocusEventHandler<Element>;
  onBlur?: FocusEventHandler<Element>;
  onKeyDown?: KeyboardEventHandler<Element>;
  'aria-describedby'?: string;
}

export interface TooltipProps {
  /** Short, plain text. A tooltip cannot contain anything interactive. */
  content: ReactNode;
  /** The one element that triggers the tooltip. It must be able to take focus. */
  children: ReactElement<TriggerProps>;
  /** Preferred side. It flips to the opposite side when there is no room. */
  placement?: TooltipPlacement;
  /** Delay before it opens on hover, in milliseconds. Focus opens it immediately. */
  openDelay?: number;
  /** Grace period to move the pointer onto the tooltip before it closes, in milliseconds. */
  closeDelay?: number;
  /** Render only the trigger. */
  disabled?: boolean;
  className?: string;
}

/**
 * A short text hint for a control, shown on hover and keyboard focus. It describes the
 * trigger (`aria-describedby`), it does not name it: icon-only buttons still need an
 * accessible name of their own.
 *
 * It follows WCAG 1.4.13: Esc dismisses it, the pointer can move onto it without it
 * closing, and it stays until the user leaves or dismisses it. It is drawn in the browser's
 * top layer with the Popover API, so no ancestor can clip it.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  openDelay = 300,
  closeDelay = 100,
  disabled = false,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<Element | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  const show = (trigger: Element, delay: number) => {
    triggerRef.current = trigger;
    clearTimer();
    if (delay > 0) {
      timerRef.current = setTimeout(() => setOpen(true), delay);
    } else {
      setOpen(true);
    }
  };

  const hide = (delay: number) => {
    clearTimer();
    if (delay > 0) {
      timerRef.current = setTimeout(() => setOpen(false), delay);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => clearTimer, []);

  // Turn a closed tooltip off when it becomes disabled.
  useEffect(() => {
    if (disabled) {
      clearTimer();
      setOpen(false);
    }
  }, [disabled]);

  useIsomorphicLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip || !open) return;

    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const { x, y, side } = computePosition(
        trigger.getBoundingClientRect(),
        { width: tooltip.offsetWidth, height: tooltip.offsetHeight },
        {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
        placement,
      );
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.dataset.placement = side;
    };

    // Without the Popover API the element still shows through the `data-open` style.
    let shown = false;
    if (typeof tooltip.showPopover === 'function') {
      tooltip.showPopover();
      shown = true;
    }
    place();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // The tooltip is the topmost thing, so Esc dismisses it first and goes no further.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    };

    // Capture so scrolling inside any ancestor moves the tooltip with its trigger.
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('keydown', onKeyDown, true);
      if (shown) tooltip.hidePopover();
    };
  }, [open, placement]);

  const trigger = Children.only(children);
  if (!isValidElement<TriggerProps>(trigger)) return <>{children}</>;
  if (disabled) return trigger;

  const own = trigger.props;
  const describedBy = [own['aria-describedby'], id].filter(Boolean).join(' ');

  const enhanced = cloneElement(trigger, {
    'aria-describedby': describedBy,
    onMouseEnter: (event) => {
      own.onMouseEnter?.(event);
      show(event.currentTarget, openDelay);
    },
    onMouseLeave: (event) => {
      own.onMouseLeave?.(event);
      hide(closeDelay);
    },
    onFocus: (event) => {
      own.onFocus?.(event);
      // Skip focus caused by a mouse click; hover already handles that case.
      let visible = true;
      try {
        visible = event.currentTarget.matches(':focus-visible');
      } catch {
        // Browsers without :focus-visible: treat every focus as keyboard focus.
      }
      if (visible) show(event.currentTarget, 0);
    },
    onBlur: (event) => {
      own.onBlur?.(event);
      hide(0);
    },
  });

  return (
    <>
      {enhanced}
      <span
        ref={tooltipRef}
        id={id}
        role="tooltip"
        popover="manual"
        className={cx(styles.root, className)}
        data-open={open ? '' : undefined}
        data-placement={placement}
        onMouseEnter={clearTimer}
        onMouseLeave={() => hide(closeDelay)}
      >
        {content}
      </span>
    </>
  );
}
