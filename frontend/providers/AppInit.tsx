"use client";

import { useInitAuth } from "@/hooks/useInitAuth";

export function AppInit({ children }: { children: React.ReactNode }) {
  useInitAuth();
  return <>{children}</>;
}
