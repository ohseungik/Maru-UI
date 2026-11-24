import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './Toast.module.css';

export type ToastTone = 'neutral' | 'danger';
export type ToastPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** What happened, in a few words. */
  title: ReactNode;
  description?: ReactNode;
  /**
   * `danger` is for errors: it is announced right away (`role="alert"`), where `neutral` waits for
   * a pause in what the screen reader is saying (`role="status"`).
   */
  tone?: ToastTone;
  /**
   * Milliseconds before it closes by itself; `0` keeps it until it is dismissed. It defaults to the
   * provider's `duration`, except that a toast with an `action` stays: there must be time to use it.
   */
  duration?: number;
  action?: ToastAction;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  /** Closes one toast, or all of them when no id is given. */
  dismiss: (id?: string) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Which corner the toasts stack in. */
  placement?: ToastPlacement;
  /** Default time on screen in milliseconds. */
  duration?: number;
  /** How many show at once; the oldest is dropped past this. */
  limit?: number;
  /** Accessible name of each close button. Translate it for your users. */
  closeLabel?: string;
  className?: string;
}

interface ToastItemData {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  tone: ToastTone;
  /** Resolved: `0` means it stays. */
  duration: number;
  action?: ToastAction;
}

const ToastContext = createContext<ToastApi | null>(null);

/** The functions to show and close toasts. It needs a `ToastProvider` above it. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return api;
}

interface ToastItemProps {
  item: ToastItemData;
  paused: boolean;
  closeLabel: string;
  onDismiss: (id: string) => void;
}

function ToastItem({ item, paused, closeLabel, onDismiss }: ToastItemProps) {
  const { id, duration } = item;
  const remaining = useRef(duration);
  const startedAt = useRef(0);

  // The clock stops while the pointer or focus is on the toasts, and picks up where it left off.
  useEffect(() => {
    if (duration <= 0 || paused) return;

    startedAt.current = Date.now();
    const timer = setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    };
  }, [duration, paused, id, onDismiss]);

  return (
    <div className={styles.toast} data-tone={item.tone} data-toast-id={id}>
      {item.tone === 'danger' ? (
        // A second cue besides color, for people who cannot tell the red from the grey.
        <span className={styles.icon} aria-hidden="true">
          !
        </span>
      ) : null}
      <div className={styles.content}>
        <div className={styles.title}>{item.title}</div>
        {item.description ? <div className={styles.description}>{item.description}</div> : null}
      </div>
      {item.action ? (
        <button
          type="button"
          className={cx(styles.button, styles.actionButton)}
          onClick={() => {
            item.action?.onClick();
            onDismiss(id);
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className={cx(styles.button, styles.close)}
        aria-label={closeLabel}
        onClick={() => onDismiss(id)}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}

/**
 * Keeps the toast list and draws it in a corner of the screen. Put it once, near the root of the
 * app and after the main content, so the toasts come last in the Tab order.
 *
 * The two live regions are always in the page, empty. A screen reader only announces what is added
 * to a live region it already knows, so adding the region together with its first message would be
 * silent.
 */
export function ToastProvider({
  children,
  placement = 'bottom-end',
  duration = 5000,
  limit = 5,
  closeLabel = 'Dismiss',
  className,
}: ToastProviderProps) {
  const [items, setItems] = useState<ToastItemData[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const counter = useRef(0);
  const defaults = useRef({ duration, limit });

  useEffect(() => {
    defaults.current = { duration, limit };
  });

  const dismiss = useCallback((id?: string) => {
    setItems((current) => (id === undefined ? [] : current.filter((item) => item.id !== id)));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    const id = `toast-${counter.current}`;
    const resolved = options.duration ?? (options.action ? 0 : defaults.current.duration);
    const item: ToastItemData = {
      id,
      title: options.title,
      description: options.description,
      tone: options.tone ?? 'neutral',
      duration: Math.max(0, resolved),
      action: options.action,
    };
    setItems((current) => [...current, item].slice(-Math.max(1, defaults.current.limit)));
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    const id = (event.target as HTMLElement).closest<HTMLElement>('[data-toast-id]')?.dataset
      .toastId;
    if (id) {
      event.stopPropagation();
      dismiss(id);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const paused = hovered || focused;
  const renderGroup = (tone: ToastTone) =>
    items
      .filter((item) => item.tone === tone)
      .map((item) => (
        <ToastItem
          key={item.id}
          item={item}
          paused={paused}
          closeLabel={closeLabel}
          onDismiss={dismiss}
        />
      ));

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- the handlers only pause the timers and let Esc close the focused toast; the controls inside are real buttons */}
      <div
        className={cx(styles.viewport, className)}
        data-placement={placement}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <div role="status" className={styles.group}>
          {renderGroup('neutral')}
        </div>
        <div role="alert" className={styles.group}>
          {renderGroup('danger')}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
