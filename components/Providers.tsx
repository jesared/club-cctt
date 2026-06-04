"use client";

import { ThemeProvider } from "next-themes";

import FeedbackDialog from "@/components/FeedbackDialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <FeedbackDialog />
    </ThemeProvider>
  );
}
