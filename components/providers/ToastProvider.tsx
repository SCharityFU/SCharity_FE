"use client";

import type { ReactNode } from "react";
import { AnimatedToastProvider } from "@/components/ui/animated-toast";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return <AnimatedToastProvider>{children}</AnimatedToastProvider>;
}
