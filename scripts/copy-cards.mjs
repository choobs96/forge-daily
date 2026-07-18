/** Copy the root cards.js (external refresh-job contract) into dist/ after build. */
import { copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(resolve(root, 'cards.js'), resolve(root, 'dist/cards.js'));
console.log('cards.js -> dist/cards.js');
