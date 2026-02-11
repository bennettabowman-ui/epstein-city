import { migrate } from '@/lib/db/migrate';

let initialized = false;

export function ensureInit() {
  if (initialized) return;
  migrate();
  initialized = true;
}
