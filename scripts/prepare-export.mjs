import { rmSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');

if (!existsSync(outDir)) {
  console.log('No export folder found.');
  process.exit(0);
}

const removeIfExists = (relativePath) => {
  const fullPath = join(outDir, relativePath);
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true });
  }
};

removeIfExists('404.html');
removeIfExists('_not-found');
removeIfExists('_not-found.html');
removeIfExists('favicon.ico');
removeIfExists('file.svg');
removeIfExists('globe.svg');
removeIfExists('next.svg');
removeIfExists('vercel.svg');
removeIfExists('window.svg');

const files = readdirSync(outDir, { withFileTypes: true });
for (const file of files) {
  if (file.isFile() && file.name.endsWith('.txt')) {
    unlinkSync(join(outDir, file.name));
  }
}

console.log('Cleaned export folder to minimal static output.');
