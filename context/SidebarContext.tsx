"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const SIDEBAR_KEY = "app.sidebar.state";

export type SidebarState = "expanded" | "collapsed" | "hidden";

type SidebarContextValue = {
  state: SidebarState;
  setState: (state: SidebarState) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SidebarState>("expanded");

  useEffect(() => {
    const storedState = localStorage.getItem(SIDEBAR_KEY);
    if (
      storedState === "expanded" ||
      storedState === "collapsed" ||
      storedState === "hidden"
    ) {
      setState(storedState);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, state);
  }, [state]);

  return (
    <SidebarContext.Provider value={{ state, setState }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider");
  }

  return context;
}

