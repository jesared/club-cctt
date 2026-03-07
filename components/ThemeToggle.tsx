"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "cyberpunk";

const THEME_STORAGE_KEY = "theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "cyberpunk";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "cyberpunk") {
    return savedTheme;
  }

  return "cyberpunk";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "cyberpunk");
  if (theme !== "light") {
    document.documentElement.classList.add(theme);
  }
}

export default function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("cyberpunk");

  useEffect(() => {
    const initialTheme = getPreferredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted ? theme === "cyberpunk" : true;

  const toggleTheme = () => {
    const nextTheme: Theme = isDarkMode ? "light" : "cyberpunk";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDarkMode}
      onClick={toggleTheme}
      className="group inline-flex h-7 w-12 items-center rounded-full border border-border bg-muted px-1 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={isDarkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
      title={isDarkMode ? "Mode sombre activé" : "Mode sombre désactivé"}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform ${
          isDarkMode ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {isDarkMode ? (
          <Moon className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Sun className="h-3 w-3" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
