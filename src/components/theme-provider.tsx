"use client";

import type { ComponentProps } from "react";
import {
  ThemeProvider as NextThemesProvider,
} from "next-themes";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;

  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }

    originalError.apply(console, args as never[]);
  };
}

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
