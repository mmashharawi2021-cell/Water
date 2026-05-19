import { copyFile, mkdir, readdir, rm, stat } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'dist');

async function copyRecursive(src, dest) {
  const sourceStat = await stat(src);
  if (sourceStat.isDirectory()) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src);
    for (const entry of entries) {
      await copyRecursive(join(src, entry), join(dest, entry));
    }
  } else {
    await copyFile(src, dest);
  }
}

async function build() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await copyRecursive(join(root, 'index.html'), join(outDir, 'index.html'));
  await copyRecursive(join(root, 'assets'), join(outDir, 'assets'));

  const publicDir = join(root, 'public');
  try {
    await copyRecursive(publicDir, outDir);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  console.log('Build complete: dist directory is ready.');
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
