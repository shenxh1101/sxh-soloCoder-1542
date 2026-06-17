import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

export function readJSONFile<T>(filename: string, defaultValue?: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw e;
  }
}

export function writeJSONFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}${timestamp}${random}`;
}
