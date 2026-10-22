import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against a rendered subtree and fails with a readable report.
 *
 * Disabled rules:
 * - color-contrast: jsdom has no layout/paint, so axe cannot compute it.
 *   Contrast is covered by the token tests in @ohseungik/maru-tokens instead.
 * - region: page-level landmark rule, meaningless for an isolated component.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });

  const report = results.violations
    .map(
      (violation) =>
        `${violation.id}: ${violation.help}\n` +
        violation.nodes.map((node) => `  ${node.html}`).join('\n'),
    )
    .join('\n');

  expect(results.violations, report).toEqual([]);
}
