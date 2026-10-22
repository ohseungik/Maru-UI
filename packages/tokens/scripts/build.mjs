import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { buildCss, buildDts, buildJs, buildResolved, loadTokens } from './lib.mjs';

const dist = new URL('../dist/', import.meta.url);

const tokens = loadTokens();
const resolved = buildResolved(tokens);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

writeFileSync(new URL('tokens.css', dist), buildCss(tokens));
writeFileSync(new URL('index.js', dist), buildJs(resolved));
writeFileSync(new URL('index.d.ts', dist), buildDts(resolved));

console.log('tokens: wrote dist/tokens.css, dist/index.js, dist/index.d.ts');
