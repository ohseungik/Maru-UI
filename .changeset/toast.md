---
'@ohseungik/maru-ui': patch
---

Add `ToastProvider` and the `useToast` hook: short messages in a corner of the screen. They are announced through live regions that are already in the page (`role="status"`, and `role="alert"` for `danger`), close by themselves, pause while the pointer or focus is on them, close with Esc, and a toast with an action stays until it is dismissed.
