import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name)));
  return files.flat();
}

const root = new URL('../dist/', import.meta.url).pathname;
const swPath = join(root, 'sw.js');
const files = (await walk(root))
  // Azure Static Web Apps consumes this file as deployment metadata and does
  // not serve it publicly, so it cannot be part of Cache.addAll().
  .filter((file) => !file.endsWith('sw.js') && !file.endsWith('.map') && !file.endsWith('staticwebapp.config.json'))
  .map((file) => `/${relative(root, file).replaceAll('\\', '/')}`);
const source = await readFile(swPath, 'utf8');
await writeFile(swPath, source.replace("self.__PRECACHE_MANIFEST__ || ['/', '/offline.html', '/manifest.webmanifest', '/assets/icon.svg']", JSON.stringify(files)), 'utf8');
