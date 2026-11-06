import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from '../../utils/cx';
import { Heading } from '../Heading';
import styles from './Dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  'open' | 'onClose' | 'onCancel' | 'title'
> {
  /** Whether the dialog is shown. The dialog is controlled: update it in `onClose`. */
  open: boolean;
  /** Called when the user asks to close (Esc, close button or backdrop click). */
  onClose: () => void;
  /** Visible title. It also names the dialog (`aria-labelledby`). */
  title: ReactNode;
  /** Optional supporting text. It also describes the dialog (`aria-describedby`). */
  description?: ReactNode;
  /** Footer area, usually the action buttons. */
  actions?: ReactNode;
  size?: DialogSize;
  /** Close when the backdrop is clicked. Turn off for forms that must not be lost. */
  closeOnBackdropClick?: boolean;
  /** Accessible name of the close button. Translate it for your users. */
  closeLabel?: string;
  /** Element to focus on open. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Keep the content in the DOM while closed. Useful to preserve form state. */
  keepMounted?: boolean;
}

/* Several dialogs can be open at once; the page may only scroll again after the last closes. */
let scrollLocks = 0;
let previousOverflow = '';

function lockScroll() {
  if (scrollLocks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

/**
 * A modal dialog built on the native `<dialog>` element. The browser provides the focus trap,
 * the inert background, Esc handling and focus restoration; this component adds the
 * controlled API, the backdrop click, the scroll lock and the visuals.
 */
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    description,
    actions,
    size = 'md',
    closeOnBackdropClick = true,
    closeLabel = 'Close',
    initialFocusRef,
    keepMounted = false,
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  // Event listeners are attached once but must always see the latest props.
  const onCloseRef = useRef(onClose);
  const openRef = useRef(open);
  const closeOnBackdropClickRef = useRef(closeOnBackdropClick);
  useEffect(() => {
    onCloseRef.current = onClose;
    openRef.current = open;
    closeOnBackdropClickRef.current = closeOnBackdropClick;
  });

  const setRefs = useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const mounted = open || keepMounted;

  // Sync the controlled `open` prop with the native modal state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    const returnFocusTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    lockScroll();
    if (initialFocusRef?.current) initialFocusRef.current.focus();

    return () => {
      unlockScroll();
      if (dialog.open) dialog.close();
      // The browser restores focus on close(), but not when React already removed the
      // dialog from the page (the usual case), so put it back ourselves. Do not steal it
      // if the user has meanwhile moved focus somewhere else on purpose.
      const current = document.activeElement;
      const focusLost = !current || current === document.body || dialog.contains(current);
      if (returnFocusTo?.isConnected && focusLost) returnFocusTo.focus();
    };
    // `initialFocusRef` is only read when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Esc, backdrop click and any other native close request go through onClose.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      // Stay controlled: the parent decides whether the dialog really closes.
      event.preventDefault();
      onCloseRef.current();
    };

    // A close we did not ask for (e.g. `<form method="dialog">`) must reach the parent too.
    // Our own `dialog.close()` runs while `open` is already false, so it is ignored here.
    const handleClose = () => {
      if (openRef.current && !dialog.open) onCloseRef.current();
    };

    // The backdrop is the dialog element itself, so a click whose press AND release both
    // landed on it (not on the panel) is a click on the backdrop. Checking mousedown avoids
    // closing when a text selection started inside the panel ends outside.
    let pressedOnBackdrop = false;
    const handleMouseDown = (event: MouseEvent) => {
      pressedOnBackdrop = event.target === dialog;
    };
    const handleClick = (event: MouseEvent) => {
      const shouldClose =
        pressedOnBackdrop && event.target === dialog && closeOnBackdropClickRef.current;
      pressedOnBackdrop = false;
      if (shouldClose) onCloseRef.current();
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('mousedown', handleMouseDown);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('mousedown', handleMouseDown);
      dialog.removeEventListener('click', handleClick);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <dialog
      {...rest}
      ref={setRefs}
      className={cx(styles.root, className)}
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* The panel keeps the padding, so every click on the dialog element is a backdrop click. */}
      <div className={styles.panel}>
        <header className={styles.header}>
          <Heading level={2} size="lg" id={titleId} className={styles.title}>
            {title}
          </Heading>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </header>
        <div className={styles.body}>{children}</div>
        {actions ? <footer className={styles.actions}>{actions}</footer> : null}
        {/* Last in the DOM so the first Tab stop is the content, not the close button. */}
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path
              d="M3 3l10 10M13 3L3 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </dialog>
  );
});
