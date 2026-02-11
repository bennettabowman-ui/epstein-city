import { SafeModeToggle } from '@/components/safe-mode-toggle';
import { CityCanvas } from '@/components/city-canvas';

async function getBuildings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/city`, { cache: 'no-store' });
  return res.json();
}

export default async function CityPage() {
  const buildings = await getBuildings();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">City Navigation</h1>
        <SafeModeToggle />
      </div>
      <CityCanvas buildings={buildings} />
    </section>
  );
}
