"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const faviconUrl =
      resolvedTheme === "dark" ? "/favicon-dark.ico" : "/favicon-light.ico";

    // Update existing favicon
    let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      // Create favicon if it doesn't exist
      favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.href = faviconUrl;
      document.head.appendChild(favicon);
    }
  }, [mounted, resolvedTheme]);

  return null;
}
