import { describe, expect, it } from 'vitest';
import { computePosition, type Rect } from './position';

const viewport = { width: 800, height: 600 };
const tooltip = { width: 100, height: 30 };

// A 40x20 trigger whose top-left corner is at (left, top).
const trigger = (left: number, top: number): Rect => ({
  left,
  top,
  right: left + 40,
  bottom: top + 20,
});

describe('computePosition', () => {
  it('centers the tooltip above the trigger by default', () => {
    expect(computePosition(trigger(380, 300), tooltip, viewport, 'top')).toEqual({
      side: 'top',
      x: 350,
      y: 300 - 8 - 30,
    });
  });

  it('places it below, left and right of the trigger', () => {
    expect(computePosition(trigger(380, 300), tooltip, viewport, 'bottom')).toMatchObject({
      side: 'bottom',
      x: 350,
      y: 328,
    });
    expect(computePosition(trigger(380, 300), tooltip, viewport, 'left')).toMatchObject({
      side: 'left',
      x: 380 - 8 - 100,
      y: 295,
    });
    expect(computePosition(trigger(380, 300), tooltip, viewport, 'right')).toMatchObject({
      side: 'right',
      x: 428,
      y: 295,
    });
  });

  it('flips to the opposite side when the preferred one does not fit', () => {
    expect(computePosition(trigger(380, 10), tooltip, viewport, 'top').side).toBe('bottom');
    expect(computePosition(trigger(380, 570), tooltip, viewport, 'bottom').side).toBe('top');
    expect(computePosition(trigger(5, 300), tooltip, viewport, 'left').side).toBe('right');
    expect(computePosition(trigger(760, 300), tooltip, viewport, 'right').side).toBe('left');
  });

  it('keeps the preferred side when neither side fits', () => {
    const tall = { width: 100, height: 400 };
    expect(computePosition(trigger(380, 290), tall, viewport, 'top').side).toBe('top');
  });

  it('does not flip when the preferred side fits', () => {
    expect(computePosition(trigger(380, 100), tooltip, viewport, 'top').side).toBe('top');
  });

  it('pushes the tooltip back inside the viewport along the other axis', () => {
    // Trigger at the left edge: centering would put the tooltip at x < 0.
    expect(computePosition(trigger(0, 300), tooltip, viewport, 'top').x).toBe(8);
    // Trigger at the right edge.
    expect(computePosition(trigger(760, 300), tooltip, viewport, 'top').x).toBe(800 - 8 - 100);
    // Vertical clamp for side placements.
    expect(computePosition(trigger(380, 0), tooltip, viewport, 'right').y).toBe(8);
    expect(computePosition(trigger(380, 580), tooltip, viewport, 'right').y).toBe(600 - 8 - 30);
  });

  it('respects a custom gap', () => {
    expect(computePosition(trigger(380, 300), tooltip, viewport, 'top', 20).y).toBe(300 - 20 - 30);
  });
});
