'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WalletsPage = dynamic(() => import('@/app-pages/Wallets'), {
  ssr: false,
  loading: () => null,
});

export default function Wallets() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <WalletsPage />;
}
