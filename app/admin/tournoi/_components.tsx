import { requireAdminSession } from "@/lib/session";
import type { ReactNode } from "react";

export { requireAdminSession };

type TournamentAdminPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
  showHeader?: boolean;
};

export function TournamentAdminPage({
  title,
  description,
  children,
  showHeader = true,
}: TournamentAdminPageProps) {
  return (
    <div
      className={`mx-auto max-w-6xl px-4 ${showHeader ? "space-y-6 py-10" : "py-8"}`}
    >
      {showHeader ? (
        <header className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Administration tournoi
          </p>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </header>
      ) : null}

      {children}
    </div>
  );
}




