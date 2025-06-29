'use client';

import DrawerLateral from '@/components/DrawerLateral';
import { useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    // Este div é o contêiner principal que organiza a tela
    <div className="min-h-screen bg-[#0e0e13] text-white flex">
      <DrawerLateral isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
      <main className="flex-1 flex p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}