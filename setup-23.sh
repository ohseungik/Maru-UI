#!/usr/bin/env bash
set -euo pipefail
trap 'rm -f .patch-23.mjs' EXIT
cat > .patch-23.mjs <<'EOF'
import { readFileSync, writeFileSync } from 'node:fs';

function patch(file, edits) {
  let text = readFileSync(file, 'utf8');
  for (const [from, to] of edits) {
    // A replacement may contain the text it replaces (then "to" present means applied),
    // or only remove text (then "from" gone means applied).
    const applied = to.includes(from)
      ? text.includes(to)
      : !text.includes(from) && text.includes(to);
    if (applied) {
      console.log(`이미 적용돼 있어서 건너뜀: ${file}`);
      continue;
    }
    const found = text.split(from).length - 1;
    if (found !== 1) {
      console.error(`패치할 문장을 찾지 못했어요 (${file}, ${found}곳 발견, 1곳 필요):\n  ${from}`);
      process.exit(1);
    }
    text = text.replace(from, () => to);
  }
  writeFileSync(file, text);
}

patch(".github/dependabot.yml", [["    groups:\n      # Minor and patch updates share one PR.", "    groups:\n      # Tools that must move together get one PR each, majors included.\n      # A group is matched in order, so these come before the catch-all below.\n      storybook:\n        patterns:\n          - 'storybook'\n          - '@storybook/*'\n      eslint:\n        patterns:\n          - 'eslint'\n          - '@eslint/js'\n      vitest:\n        patterns:\n          - 'vitest'\n          - '@vitest/*'\n      # Minor and patch updates share one PR."]]);

EOF
node .patch-23.mjs

echo "23번 적용 완료. 커밋하고 push하세요."
