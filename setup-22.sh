#!/usr/bin/env bash
set -euo pipefail
trap 'rm -f .patch-22.mjs' EXIT
cat > .patch-22.mjs <<'EOF'
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

patch(".github/workflows/release.yml", [["uses: changesets/action@v2", "uses: changesets/action@v1"]]);

patch(".github/dependabot.yml", [["  - package-ecosystem: github-actions\n    directory: /\n    schedule:\n      interval: weekly\n", "  - package-ecosystem: github-actions\n    directory: /\n    schedule:\n      interval: weekly\n    ignore:\n      # changesets/action v2 needs @changesets/cli v3 and renames its inputs.\n      # Upgrade both together, by hand.\n      - dependency-name: 'changesets/action'\n        update-types: ['version-update:semver-major']\n"]]);

EOF
node .patch-22.mjs

echo "22번 적용 완료. 커밋하고 push하세요."
