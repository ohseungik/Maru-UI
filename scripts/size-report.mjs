// Reports the size of the files a consumer downloads and fails when one grows past its budget.
// Run after `pnpm build`: `pnpm size`. In GitHub Actions the table is also added to the job summary.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

// Budgets are for the gzip size, because that is what travels over the network.
// They sit a bit above today's size so that normal work does not trip them, but a component
// that adds a dependency or a pile of CSS does. Raise one on purpose, in the same PR,
// and say why in the PR description.
const BUDGETS = [
  { label: '@ohseungik/maru-ui · index.js', file: 'packages/components/dist/index.js', gzipKb: 8 },
  {
    label: '@ohseungik/maru-ui · styles.css',
    file: 'packages/components/dist/styles.css',
    gzipKb: 5,
  },
  {
    label: '@ohseungik/maru-tokens · tokens.css',
    file: 'packages/tokens/dist/tokens.css',
    gzipKb: 3,
  },
];

const root = new URL('../', import.meta.url);
// Same unit as Vite's build output (1 kB = 1000 bytes), so the numbers can be compared.
const kb = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;

const rows = [];
const missing = [];

for (const entry of BUDGETS) {
  const url = new URL(entry.file, root);
  if (!existsSync(url)) {
    missing.push(entry.file);
    continue;
  }
  const source = readFileSync(url);
  const gzip = gzipSync(source, { level: 9 }).length;
  const brotli = brotliCompressSync(source, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;
  const budget = entry.gzipKb * 1000;
  rows.push({ ...entry, raw: source.length, gzip, brotli, budget, ok: gzip <= budget });
}

if (missing.length > 0) {
  console.error(
    `Missing build output:\n${missing.map((f) => `  - ${f}`).join('\n')}\nRun "pnpm build" first.`,
  );
  process.exit(1);
}

const percent = (row) => `${Math.round((row.gzip / row.budget) * 100)}%`;

const header = ['File', 'Raw', 'Gzip', 'Brotli', 'Gzip budget', 'Used'];
const table = rows.map((row) => [
  row.label,
  kb(row.raw),
  kb(row.gzip),
  kb(row.brotli),
  `${row.gzipKb.toFixed(2)} kB`,
  `${percent(row)}${row.ok ? '' : '  OVER BUDGET'}`,
]);

const widths = header.map((title, i) => Math.max(title.length, ...table.map((r) => r[i].length)));
const line = (cells) =>
  cells
    .map((cell, i) => cell.padEnd(widths[i]))
    .join('  ')
    .trimEnd();
console.log([line(header), line(widths.map((w) => '-'.repeat(w))), ...table.map(line)].join('\n'));

const summaryFile = process.env['GITHUB_STEP_SUMMARY'];
if (summaryFile) {
  const md = [
    '### Bundle size',
    '',
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((row, i) => {
      const [label = '', ...rest] = table[i] ?? [];
      return `| ${row.ok ? '✅' : '❌'} ${label} | ${rest.join(' | ')} |`;
    }),
    '',
  ].join('\n');
  appendFileSync(summaryFile, `${md}\n`);
}

const over = rows.filter((row) => !row.ok);
if (over.length > 0) {
  console.error(
    `\nBundle size check failed:\n${over
      .map((row) => `  - ${row.label}: ${kb(row.gzip)} gzip, budget ${row.gzipKb} kB`)
      .join('\n')}`,
  );
  process.exit(1);
}

console.log('\nBundle size check passed: every file is within its gzip budget.');
