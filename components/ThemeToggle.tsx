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
        "relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 border-border border-2 ",
        isDark ? "bg-primary" : "bg-border",
      )}
    >
      {/* BULLE */}
      <span
        className={cn(
          "absolute flex h-7.5 w-7.5 items-center justify-center rounded-full   shadow-md transition-all duration-300",
          isDark
            ? "translate-x-7 bg-background text-primary-foreground"
            : "translate-x-1 bg-card text-secondary-foreground",
        )}
      >
        {isDark ? (
          <Sun className="h-4.5 w-4.5 " />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}
