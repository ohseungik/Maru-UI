import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  buildCss,
  buildResolved,
  collectVariables,
  contrastRatio,
  flatten,
  loadTokens,
  resolveValue,
} from '../scripts/lib.mjs';

const tokens = loadTokens();
const resolved = buildResolved(tokens);

const color = (theme, name) => {
  const value = name.split('.').reduce((node, key) => node?.[key], resolved.semantic[theme].color);
  assert.equal(typeof value, 'string', `missing color token: ${theme}.${name}`);
  return value;
};

describe('token structure', () => {
  test('every reference resolves to a raw value', () => {
    for (const group of ['palette', 'scale', 'semantic']) {
      for (const { path, value } of flatten(tokens[group], [group])) {
        assert.doesNotThrow(() => resolveValue(tokens, value), path.join('.'));
      }
    }
  });

  test('light and dark themes define exactly the same tokens', () => {
    const names = (theme) =>
      flatten(tokens.semantic[theme])
        .map(({ path }) => path.join('.'))
        .sort();
    assert.deepEqual(names('dark'), names('light'));
  });

  test('CSS variable names are unique within each block', () => {
    const { base, light, dark } = collectVariables(tokens);
    for (const [block, variables] of Object.entries({ base, light, dark })) {
      const names = variables.map(({ name }) => name);
      assert.equal(new Set(names).size, names.length, `duplicate variable in ${block}`);
    }
  });

  test('semantic tokens keep their alias chain in CSS', () => {
    const css = buildCss(tokens);
    assert.match(css, /--maru-color-action-bg: var\(--maru-palette-blue-600\);/);
    assert.match(css, /--maru-space-4: 1rem;/);
  });

  test('dark theme is available via attribute and via OS preference', () => {
    const css = buildCss(tokens);
    assert.match(css, /\[data-theme='dark'\] \{/);
    assert.match(
      css,
      /@media \(prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-theme='light'\]\)/,
    );
  });
});

describe('WCAG contrast', () => {
  // [foreground, background] pairs that are rendered as text
  const textPairs = [
    ['text.default', 'bg.default'],
    ['text.default', 'bg.subtle'],
    ['text.muted', 'bg.default'],
    ['text.muted', 'bg.subtle'],
    ['text.danger', 'bg.default'],
    ['text.danger', 'bg.subtle'],
    ['action.fg', 'action.bg'],
    ['action.fg', 'action.bg-hover'],
    ['action.fg', 'action.bg-active'],
    ['action.text', 'bg.default'],
    ['action.text', 'action.ghost-bg-hover'],
    ['action.text', 'action.ghost-bg-active'],
    ['danger.fg', 'danger.bg'],
    ['danger.fg', 'danger.bg-hover'],
    ['danger.fg', 'danger.bg-active'],
    ['neutral.fg', 'neutral.bg'],
    ['neutral.fg', 'neutral.bg-hover'],
    ['neutral.fg', 'neutral.bg-active'],
  ];

  // Non-text UI parts (focus ring, control borders) need 3:1 against the page
  const uiPairs = [
    ['focus.ring', 'bg.default'],
    ['border.strong', 'bg.default'],
  ];

  for (const theme of ['light', 'dark']) {
    for (const [fg, bg] of textPairs) {
      test(`${theme}: ${fg} on ${bg} meets AA (4.5:1)`, () => {
        const ratio = contrastRatio(color(theme, fg), color(theme, bg));
        assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1`);
      });
    }
    for (const [fg, bg] of uiPairs) {
      test(`${theme}: ${fg} on ${bg} meets non-text contrast (3:1)`, () => {
        const ratio = contrastRatio(color(theme, fg), color(theme, bg));
        assert.ok(ratio >= 3, `${ratio.toFixed(2)}:1`);
      });
    }
  }
});
