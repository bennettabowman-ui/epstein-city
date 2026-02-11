import { ensureInit } from '@/lib/bootstrap';
import { ingestFolder } from '@/lib/indexing/ingest';
import { generateSeedDataset } from './seed-data';

async function run() {
  ensureInit();
  const folder = generateSeedDataset();
  const result = await ingestFolder(folder);
  console.log('Seeded', result);
}

run();
