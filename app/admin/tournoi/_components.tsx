import { requireAdminSession } from "@/lib/session";
import type { ReactNode } from "react";

export { requireAdminSession };

type TournamentAdminPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function TournamentAdminPage({
  title,
  description,
  children,
}: TournamentAdminPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Administration tournoi
        </p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      {children}
    </div>
  );
}




