import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are off, so Testing Library cannot register its own cleanup.
afterEach(() => {
  cleanup();
});

// jsdom implements <dialog>'s `open` attribute but not showModal() / close().
// This stand-in mirrors the parts of the spec the tests rely on: showModal() opens, and
// close() closes and fires `close` asynchronously (a queued task, as in browsers).
// It has no focus trap, inert background or top layer; those are covered in a real browser.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    if (this.open) {
      throw new DOMException('The dialog is already open.', 'InvalidStateError');
    }
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.open) return;
    this.removeAttribute('open');
    setTimeout(() => this.dispatchEvent(new Event('close')), 0);
  };
}

// jsdom has no Popover API either. These stand-ins only record the state, so tests can see
// that showPopover() / hidePopover() were called; top layer and light dismiss are not modeled.
// Typed as Partial so the check is not narrowed away: newer lib.dom versions already declare both.
const elementPrototype: Partial<HTMLElement> | undefined =
  typeof HTMLElement === 'undefined' ? undefined : HTMLElement.prototype;

if (elementPrototype && typeof elementPrototype.showPopover !== 'function') {
  elementPrototype.showPopover = function showPopover(this: HTMLElement) {
    this.setAttribute('data-popover-showing', '');
  };
  elementPrototype.hidePopover = function hidePopover(this: HTMLElement) {
    this.removeAttribute('data-popover-showing');
  };
}
