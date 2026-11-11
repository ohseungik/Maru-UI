// Checks the finished build for things that are easy to break without noticing.
// Run by `pnpm build` after Vite and tsc; exits with an error message when something is wrong.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const problems = [];

const read = (name) => readFileSync(new URL(name, dist), 'utf8');
const exists = (name) => existsSync(fileURLToPath(new URL(name, dist)));

for (const file of ['index.js', 'index.d.ts', 'styles.css']) {
  if (!exists(file)) {
    problems.push(`dist/${file} is missing.`);
  } else if (statSync(new URL(file, dist)).size === 0) {
    problems.push(`dist/${file} is empty.`);
  }
}

if (exists('index.js')) {
  const code = read('index.js');

  // The directive only counts when it is the very first statement of the file.
  if (!/^\s*(['"])use client\1;?/.test(code)) {
    problems.push(
      'dist/index.js must start with "use client". Without it, Next.js Server Components cannot import the library.',
    );
  }

  // The bundle must not pull in react-dom or anything else the consumer did not install.
  // Only look at real import/export statements at the start of a line, not at comments or strings.
  const importPattern =
    /^\s*(?:import|export)\b[^;'"]*?\bfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm;
  const imports = [...code.matchAll(importPattern)]
    .map((m) => m[1] ?? m[2])
    .filter((name) => !name.startsWith('.') && !name.startsWith('/'));
  const allowed = new Set(['react', 'react/jsx-runtime']);
  for (const name of new Set(imports)) {
    if (!allowed.has(name))
      problems.push(`dist/index.js imports "${name}", which is not a peer dependency.`);
  }
}

if (problems.length > 0) {
  console.error(`Build check failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}

console.log('Build check passed: "use client" banner, declarations, styles and imports are fine.');
