import { Suspense } from 'react';
import BrowsePage from '../browse/page';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Searching titles...</div>}>
      <BrowsePage />
    </Suspense>
  );
}

