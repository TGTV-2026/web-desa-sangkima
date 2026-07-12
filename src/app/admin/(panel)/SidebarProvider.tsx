"use client";

import { createContext, useContext, useState } from "react";

// State sidebar CMS dibagi antara tombol di header (SidebarToggle) dan sidebar
// (CmsSidebar). Dua boolean terpisah: `collapsed` untuk lipat kolom desktop,
// `drawerOpen` untuk drawer overlay mobile — keduanya default sama di server &
// klien (false-ish) agar tak ada hydration mismatch.
type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function useSidebar() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSidebar harus dipakai di dalam SidebarProvider");
  return c;
}

export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false); // desktop mulai terbuka
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile mulai tertutup

  return (
    <Ctx.Provider
      value={{ collapsed, setCollapsed, drawerOpen, setDrawerOpen }}
    >
      {children}
    </Ctx.Provider>
  );
}
