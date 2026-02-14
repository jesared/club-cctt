"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "cyberpunk";

const THEME_STORAGE_KEY = "theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "cyberpunk") {
    return savedTheme;
  }

  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "cyberpunk");
  if (theme !== "light") {
    document.documentElement.classList.add(theme);
  }
}

export default function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getPreferredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const cycle: Theme[] = ["light", "cyberpunk"];
    const currentIndex = cycle.indexOf(theme);
    const nextTheme = cycle[(currentIndex + 1) % cycle.length];
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={
        isMounted
          ? theme === "light"
            ? "Activer le thème cyberpunk"
            : "Activer le thème clair"
          : "Basculer le thème"
      }
      title={
        isMounted
          ? theme === "light"
            ? "Mode clair"
            : "Mode cyberpunk"
          : "Thème"
      }
    >
      {isMounted && theme === "cyberpunk" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
