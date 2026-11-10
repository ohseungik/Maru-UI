export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Position {
  x: number;
  y: number;
  /** The side that was actually used, after flipping. */
  side: TooltipPlacement;
}

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/**
 * Places a tooltip next to its trigger, in viewport coordinates (for `position: fixed`).
 *
 * - If the preferred side does not fit but the opposite one does, it flips.
 * - Along the other axis it is centered on the trigger, then pushed back inside the viewport.
 */
export function computePosition(
  trigger: Rect,
  tooltip: Size,
  viewport: Viewport,
  placement: TooltipPlacement,
  gap = 8,
  margin = 8,
): Position {
  const fits: Record<TooltipPlacement, boolean> = {
    top: trigger.top - gap - tooltip.height >= margin,
    bottom: trigger.bottom + gap + tooltip.height <= viewport.height - margin,
    left: trigger.left - gap - tooltip.width >= margin,
    right: trigger.right + gap + tooltip.width <= viewport.width - margin,
  };

  const side = !fits[placement] && fits[OPPOSITE[placement]] ? OPPOSITE[placement] : placement;

  const clamp = (value: number, size: number, limit: number) =>
    Math.max(margin, Math.min(value, limit - margin - size));

  const centerX = (trigger.left + trigger.right) / 2 - tooltip.width / 2;
  const centerY = (trigger.top + trigger.bottom) / 2 - tooltip.height / 2;

  switch (side) {
    case 'top':
      return {
        side,
        x: clamp(centerX, tooltip.width, viewport.width),
        y: trigger.top - gap - tooltip.height,
      };
    case 'bottom':
      return {
        side,
        x: clamp(centerX, tooltip.width, viewport.width),
        y: trigger.bottom + gap,
      };
    case 'left':
      return {
        side,
        x: trigger.left - gap - tooltip.width,
        y: clamp(centerY, tooltip.height, viewport.height),
      };
    case 'right':
      return {
        side,
        x: trigger.right + gap,
        y: clamp(centerY, tooltip.height, viewport.height),
      };
  }
}
