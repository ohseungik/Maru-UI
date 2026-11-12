// Serves the built Storybook (apps/docs/storybook-static) for the visual tests.
// A tiny static server on purpose: no extra dependency, and no surprises from a dev server.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.STORYBOOK_DIR
  ? resolve(process.env.STORYBOOK_DIR)
  : fileURLToPath(new URL('../storybook-static/', import.meta.url));
const port = Number(process.env.PORT ?? 6007);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

if (!existsSync(join(root, 'index.json'))) {
  console.error(`No Storybook build found in ${root}. Run "pnpm build" first.`);
  process.exit(1);
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  // Resolve inside the root only, so "../" in a URL cannot read other files.
  const file = normalize(join(root, decodeURIComponent(pathname)));
  const inside = file === root || file.startsWith(root + sep);

  let target = file;
  if (inside && existsSync(target) && statSync(target).isDirectory()) {
    target = join(target, 'index.html');
  }

  if (!inside || !existsSync(target)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'content-type': types[extname(target)] ?? 'application/octet-stream' });
  createReadStream(target).pipe(response);
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
