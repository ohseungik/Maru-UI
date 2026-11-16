// Checks what would be published to npm, without publishing anything.
// Run after `pnpm build`: `pnpm verify:pack`. `pnpm release` runs it before `changeset publish`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PACKAGES = ['packages/tokens', 'packages/components'];
// A published tarball should stay small. Raise this on purpose if a package really needs more.
const MAX_TARBALL_KB = 200;

const root = new URL('../', import.meta.url);
const problems = [];

// Every file an `exports` entry points at must be inside the tarball.
function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(exportTargets);
  return [];
}

function pack(dir) {
  const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: new URL(`${dir}/`, root),
    encoding: 'utf8',
    // `npm` is a .cmd file on Windows and cannot be started without a shell there.
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const [result] = JSON.parse(output);
  if (!result) throw new Error(`npm pack returned no result for ${dir}`);
  return result;
}

for (const dir of PACKAGES) {
  const manifest = JSON.parse(readFileSync(new URL(`${dir}/package.json`, root), 'utf8'));
  const name = manifest.name;
  const fail = (message) => problems.push(`${name}: ${message}`);

  if (manifest.private) fail('"private" is true, so it can not be published.');
  for (const field of ['version', 'license', 'description', 'repository']) {
    if (!manifest[field]) fail(`package.json has no "${field}".`);
  }
  if (manifest.publishConfig?.access !== 'public') {
    fail('publishConfig.access must be "public" for a scoped package.');
  }

  const result = pack(dir);
  const files = result.files.map((file) => file.path);
  const has = (file) => files.includes(file);

  for (const file of ['package.json', 'README.md', 'LICENSE']) {
    if (!has(file)) fail(`${file} is missing from the tarball.`);
  }

  const targets = exportTargets(manifest.exports).filter((target) => target.startsWith('./'));
  for (const target of targets) {
    const file = target.slice(2);
    if (!has(file)) fail(`"${target}" is in "exports" but not in the tarball. Did the build run?`);
  }

  const allowedRoot = new Set(['package.json', 'README.md', 'LICENSE', 'CHANGELOG.md']);
  for (const file of files) {
    if (allowedRoot.has(file) || file.startsWith('dist/')) continue;
    fail(`unexpected file in the tarball: ${file}`);
  }
  for (const file of files) {
    if (/\.(test|spec|stories)\.[cm]?[jt]sx?(\.map)?$/.test(file)) {
      fail(`test or story file in the tarball: ${file}`);
    }
  }

  const sizeKb = result.size / 1000;
  if (sizeKb > MAX_TARBALL_KB) {
    fail(`tarball is ${sizeKb.toFixed(1)} kB, over the ${MAX_TARBALL_KB} kB limit.`);
  }

  console.log(
    `${name}@${manifest.version}: ${files.length} files, ` +
      `${sizeKb.toFixed(1)} kB packed, ${(result.unpackedSize / 1000).toFixed(1)} kB unpacked`,
  );
  for (const file of files) console.log(`  ${file}`);
}

if (problems.length > 0) {
  console.error(`\nPackage check failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}

console.log('\nPackage check passed: the tarballs contain what they should and nothing else.');
