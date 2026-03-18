"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Changer le thème"
      className={cn(
        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 border border-accent/30",
        isDark ? "bg-zinc-800" : "bg-zinc-300",
      )}
    >
      {/* BULLE */}
      <span
        className={cn(
          "absolute flex h-6 w-6 items-center justify-center rounded-full  shadow-md transition-all duration-300",
          isDark ? "translate-x-7" : "translate-x-1",
        )}
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-secondary" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-zinc-700" />
        )}
      </span>
    </button>
  );
}
