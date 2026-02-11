import fs from 'node:fs';
import path from 'node:path';

const samples = [
  {
    name: 'flight_logs.txt',
    text: `January 12, 2003\nManifest notes from Palm Beach Airport.\nAttendees: John Mercer, Atlas Foundation, New York City.`
  },
  {
    name: 'deposition_summary.txt',
    text: `Interview held on 03/14/2006 in Miami Beach Hotel.\nReference to Orion LLC and witness Sarah Klein.`
  },
  {
    name: 'court_metadata.json',
    text: JSON.stringify({
      hearingDate: '2008-07-21',
      organizations: ['Atlas Foundation', 'Orion LLC'],
      location: 'Palm Beach County Court'
    })
  },
  {
    name: 'contacts.txt',
    text: `Private contact list: jane@example.com, 212-555-1212, 123 Ocean Avenue.`
  }
];

export function generateSeedDataset() {
  const dir = path.join(process.cwd(), '.data', 'seed');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of samples) fs.writeFileSync(path.join(dir, s.name), s.text, 'utf8');
  return dir;
}
