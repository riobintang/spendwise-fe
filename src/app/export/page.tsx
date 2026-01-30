'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ExportPage = dynamic(() => import('@/app-pages/Export'), {
  ssr: false,
  loading: () => null,
});

export default function Export() {
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

  return <ExportPage />;
}
