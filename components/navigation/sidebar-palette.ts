export type SidebarPalette = {
  section: string;
  sectionExpanded: string;
  sectionGlow: string;
  icon: string;
  activeIcon: string;
  activeRow: string;
  hoverRow: string;
  badge: string;
  chrome: string;
};

const palettes: Record<string, SidebarPalette> = {
  "Mon espace": {
    section:
      "border-white/8 bg-white/[0.035] dark:border-white/8 dark:bg-white/[0.035]",
    sectionExpanded:
      "border-emerald-400/18 bg-white/[0.055] shadow-[0_14px_32px_-24px_rgba(16,185,129,0.45)] dark:border-emerald-300/16 dark:bg-white/[0.05]",
    sectionGlow: "from-emerald-400/0 via-emerald-400/65 to-emerald-400/0",
    icon: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/12 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-300/10",
    activeIcon:
      "bg-emerald-600 text-white dark:bg-emerald-300 dark:text-emerald-950",
    activeRow:
      "bg-emerald-500/9 text-foreground before:bg-emerald-500 shadow-sm ring-1 ring-emerald-500/12 dark:bg-emerald-400/10 dark:before:bg-emerald-200 dark:ring-emerald-300/10",
    hoverRow:
      "text-foreground/80 hover:bg-white/[0.05] hover:text-foreground dark:text-muted-foreground dark:hover:bg-white/[0.045] dark:hover:text-foreground",
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
    chrome:
      "from-emerald-100 via-white to-emerald-50 dark:from-emerald-500/10 dark:via-slate-950 dark:to-emerald-400/5",
  },
  Administration: {
    section:
      "border-white/8 bg-white/[0.035] dark:border-white/8 dark:bg-white/[0.035]",
    sectionExpanded:
      "border-sky-400/16 bg-white/[0.055] shadow-[0_14px_32px_-24px_rgba(56,189,248,0.45)] dark:border-sky-300/14 dark:bg-white/[0.05]",
    sectionGlow: "from-sky-400/0 via-sky-400/65 to-sky-400/0",
    icon: "bg-muted/85 text-muted-foreground ring-1 ring-white/8 dark:bg-white/8 dark:text-slate-300 dark:ring-white/8",
    activeIcon:
      "bg-foreground text-background dark:bg-white dark:text-slate-950",
    activeRow:
      "bg-background/90 text-foreground before:bg-foreground shadow-sm ring-1 ring-border/60 dark:bg-white/[0.06] dark:before:bg-white dark:ring-white/8",
    hoverRow:
      "text-foreground/80 hover:bg-white/[0.05] hover:text-foreground dark:text-muted-foreground dark:hover:bg-white/[0.045] dark:hover:text-foreground",
    badge:
      "border-border bg-background text-foreground/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100",
    chrome:
      "from-slate-100 via-white to-slate-50 dark:from-slate-500/10 dark:via-slate-950 dark:to-slate-500/5",
  },
  "Admin tournoi": {
    section:
      "border-white/8 bg-white/[0.035] dark:border-white/8 dark:bg-white/[0.035]",
    sectionExpanded:
      "border-[#FFB06B]/18 bg-white/[0.055] shadow-[0_14px_32px_-24px_rgba(255,122,0,0.5)] dark:border-[#FFB06B]/18 dark:bg-white/[0.05]",
    sectionGlow: "from-[#FF7A00]/0 via-[#FF7A00]/70 to-[#FF7A00]/0",
    icon: "bg-[#FF7A00]/10 text-[#FF7A00] ring-1 ring-[#FF7A00]/12 dark:bg-[#FF7A00]/12 dark:text-[#FFB06B] dark:ring-[#FFB06B]/10",
    activeIcon:
      "bg-[#FF7A00] text-stone-950 dark:bg-[#FFB06B] dark:text-stone-950",
    activeRow:
      "bg-[#FF7A00]/9 text-foreground before:bg-[#FF7A00] shadow-sm ring-1 ring-[#FF7A00]/14 dark:bg-[#FF7A00]/12 dark:before:bg-[#FFB06B] dark:ring-[#FFB06B]/12",
    hoverRow:
      "text-foreground/80 hover:bg-white/[0.05] hover:text-foreground dark:text-muted-foreground dark:hover:bg-white/[0.045] dark:hover:text-foreground",
    badge:
      "border-[#FF7A00]/20 bg-[#FF7A00]/10 text-[#FF7A00] dark:border-[#FF7A00]/20 dark:bg-[#FF7A00]/10 dark:text-[#FFD2A8]",
    chrome:
      "from-stone-100 via-white to-[#FF7A00]/[0.08] dark:from-stone-500/10 dark:via-slate-950 dark:to-[#FF7A00]/[0.08]",
  },
};

const fallbackPalette: SidebarPalette = {
  section:
    "border-border/80 bg-background/80 dark:border-border dark:bg-background/40",
  sectionExpanded:
    "border-border bg-muted/35 dark:border-border dark:bg-muted/20",
  sectionGlow: "from-transparent via-white/0 to-transparent",
  icon: "bg-muted text-muted-foreground",
  activeIcon: "bg-primary text-primary-foreground",
  activeRow:
    "bg-background text-foreground before:bg-primary shadow-sm ring-1 ring-border",
  hoverRow: "text-muted-foreground hover:bg-background hover:text-foreground",
  badge:
    "border-border bg-background text-muted-foreground dark:border-border dark:bg-muted/20 dark:text-foreground",
  chrome: "from-muted/50 via-background to-background",
};

export function getSidebarPalette(sectionTitle: string) {
  return palettes[sectionTitle] ?? fallbackPalette;
}
