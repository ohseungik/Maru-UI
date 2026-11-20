export type Placement = 'top' | 'bottom' | 'left' | 'right';

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
  side: Placement;
}

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/**
 * Places a floating element (tooltip, popover) next to its trigger, in viewport coordinates
 * (for `position: fixed`).
 *
 * - If the preferred side does not fit but the opposite one does, it flips.
 * - Along the other axis it is centered on the trigger, then pushed back inside the viewport.
 */
export function computePosition(
  trigger: Rect,
  floating: Size,
  viewport: Viewport,
  placement: Placement,
  gap = 8,
  margin = 8,
): Position {
  const fits: Record<Placement, boolean> = {
    top: trigger.top - gap - floating.height >= margin,
    bottom: trigger.bottom + gap + floating.height <= viewport.height - margin,
    left: trigger.left - gap - floating.width >= margin,
    right: trigger.right + gap + floating.width <= viewport.width - margin,
  };

  const side = !fits[placement] && fits[OPPOSITE[placement]] ? OPPOSITE[placement] : placement;

  const clamp = (value: number, size: number, limit: number) =>
    Math.max(margin, Math.min(value, limit - margin - size));

  const centerX = (trigger.left + trigger.right) / 2 - floating.width / 2;
  const centerY = (trigger.top + trigger.bottom) / 2 - floating.height / 2;

  switch (side) {
    case 'top':
      return {
        side,
        x: clamp(centerX, floating.width, viewport.width),
        y: trigger.top - gap - floating.height,
      };
    case 'bottom':
      return {
        side,
        x: clamp(centerX, floating.width, viewport.width),
        y: trigger.bottom + gap,
      };
    case 'left':
      return {
        side,
        x: trigger.left - gap - floating.width,
        y: clamp(centerY, floating.height, viewport.height),
      };
    case 'right':
      return {
        side,
        x: trigger.right + gap,
        y: clamp(centerY, floating.height, viewport.height),
      };
  }
}
