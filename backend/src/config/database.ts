import fs from 'node:fs';
import path from 'node:path';
import { Level } from 'level';
import { env } from './env.js';

const dir = path.dirname(env.dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Level<string, unknown>(env.dbPath, {
  valueEncoding: 'json',
});
