export type SidebarPalette = {
  section: string;
  sectionExpanded: string;
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
      "border-emerald-500/20 bg-emerald-500/[0.04] dark:border-emerald-400/15 dark:bg-emerald-500/[0.06]",
    sectionExpanded:
      "border-emerald-500/30 bg-emerald-500/[0.08] dark:border-emerald-400/20 dark:bg-emerald-500/[0.09]",
    icon: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-200",
    activeIcon:
      "bg-emerald-600 text-white dark:bg-emerald-300 dark:text-emerald-950",
    activeRow:
      "bg-emerald-500/10 text-foreground before:bg-emerald-500 shadow-sm dark:bg-emerald-400/10 dark:before:bg-emerald-200",
    hoverRow:
      "text-foreground/80 hover:bg-emerald-500/8 hover:text-foreground dark:text-muted-foreground dark:hover:bg-emerald-400/6 dark:hover:text-foreground",
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
    chrome:
      "from-emerald-100 via-white to-emerald-50 dark:from-emerald-500/10 dark:via-slate-950 dark:to-emerald-400/5",
  },
  Administration: {
    section:
      "border-border/70 bg-background/50 dark:border-white/8 dark:bg-white/[0.03]",
    sectionExpanded:
      "border-border bg-background/75 dark:border-white/10 dark:bg-white/[0.05]",
    icon: "bg-muted text-muted-foreground dark:bg-white/8 dark:text-slate-300",
    activeIcon:
      "bg-foreground text-background dark:bg-white dark:text-slate-950",
    activeRow:
      "bg-background text-foreground before:bg-foreground shadow-sm ring-1 ring-border dark:bg-white/[0.06] dark:before:bg-white",
    hoverRow:
      "text-foreground/80 hover:bg-background/70 hover:text-foreground dark:text-muted-foreground dark:hover:bg-white/[0.05] dark:hover:text-foreground",
    badge:
      "border-border bg-background text-foreground/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100",
    chrome:
      "from-slate-100 via-white to-slate-50 dark:from-slate-500/10 dark:via-slate-950 dark:to-slate-500/5",
  },
  "Admin tournoi": {
    section:
      "border-amber-500/20 bg-amber-500/[0.04] dark:border-amber-300/15 dark:bg-amber-500/[0.05]",
    sectionExpanded:
      "border-amber-500/30 bg-amber-500/[0.08] dark:border-amber-300/20 dark:bg-amber-500/[0.08]",
    icon: "bg-amber-500/10 text-amber-700 dark:bg-amber-300/12 dark:text-amber-200",
    activeIcon:
      "bg-amber-400 text-stone-950 dark:bg-amber-200 dark:text-stone-950",
    activeRow:
      "bg-amber-500/10 text-foreground before:bg-amber-500 shadow-sm dark:bg-amber-400/10 dark:before:bg-amber-200",
    hoverRow:
      "text-foreground/80 hover:bg-amber-500/8 hover:text-foreground dark:text-muted-foreground dark:hover:bg-amber-400/6 dark:hover:text-foreground",
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100",
    chrome:
      "from-stone-100 via-white to-amber-50/70 dark:from-stone-500/10 dark:via-slate-950 dark:to-amber-500/5",
  },
};

const fallbackPalette: SidebarPalette = {
  section:
    "border-border/80 bg-background/80 dark:border-border dark:bg-background/40",
  sectionExpanded:
    "border-border bg-muted/35 dark:border-border dark:bg-muted/20",
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
