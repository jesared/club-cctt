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
      "border-[#FF7A00]/20 bg-[#FF7A00]/[0.04] dark:border-[#FF7A00]/20 dark:bg-[#FF7A00]/[0.06]",
    sectionExpanded:
      "border-[#FF7A00]/30 bg-[#FF7A00]/[0.08] dark:border-[#FF7A00]/30 dark:bg-[#FF7A00]/[0.1]",
    icon: "bg-[#FF7A00]/10 text-[#FF7A00] dark:bg-[#FF7A00]/12 dark:text-[#FFB06B]",
    activeIcon:
      "bg-[#FF7A00] text-stone-950 dark:bg-[#FFB06B] dark:text-stone-950",
    activeRow:
      "bg-[#FF7A00]/10 text-foreground before:bg-[#FF7A00] shadow-sm dark:bg-[#FF7A00]/12 dark:before:bg-[#FFB06B]",
    hoverRow:
      "text-foreground/80 hover:bg-[#FF7A00]/8 hover:text-foreground dark:text-muted-foreground dark:hover:bg-[#FF7A00]/8 dark:hover:text-foreground",
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
