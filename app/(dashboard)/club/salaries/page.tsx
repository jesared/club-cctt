import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, Users } from "lucide-react";

import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SimpleMember } from "@/lib/comite-content";
import { getComiteResponse } from "@/lib/comite-service";

const DEFAULT_AVATAR_SRC = "/comite/avatar-default.svg";

export const metadata: Metadata = {
  title: "Salariés diplômés - CCTT",
  description:
    "Retrouvez les salariés diplômés du Chalons-en-Champagne Tennis de Table.",
};

function resolvePhoto(photo: string) {
  return photo || DEFAULT_AVATAR_SRC;
}

type DiplomaItem = {
  label: string;
  year?: string;
};

function cleanDiplomaText(value: string) {
  return value
    .replace(/dipl[oô]mes?\s*(et|&)\s*certifications?/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeDiplomas(items: DiplomaItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.label.toLowerCase()}::${item.year ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseDiplomaItems(description: string): DiplomaItem[] {
  const normalized = cleanDiplomaText(description);

  if (!normalized) {
    return [];
  }

  const items: DiplomaItem[] = [];

  for (const match of normalized.matchAll(
    /([^:.;\n]+?)\s*:\s*((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)/gi,
  )) {
    const label = match[1]?.trim();
    const year = match[2]?.replace(/\s+/g, "");

    if (label) {
      items.push({ label, year });
    }
  }

  for (const match of normalized.matchAll(
    /([^:.;\n]+?)\s+ann[ée]e?\s+((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)/gi,
  )) {
    const label = match[1]?.trim();
    const year = match[2]?.replace(/\s+/g, "");

    if (label) {
      items.push({ label, year });
    }
  }

  for (const line of description.split(/\r?\n/)) {
    const cleanedLine = cleanDiplomaText(line);

    if (!cleanedLine) {
      continue;
    }

    const titleThenYear = cleanedLine.match(
      /^(.*?)(?:\s*:\s*|\s+)((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)$/i,
    );

    if (titleThenYear?.[1]) {
      items.push({
        label: titleThenYear[1].trim(),
        year: titleThenYear[2]?.replace(/\s+/g, ""),
      });
      continue;
    }

    const yearThenTitle = cleanedLine.match(
      /^((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)\s+(.*)$/i,
    );

    if (yearThenTitle?.[2]) {
      items.push({
        label: yearThenTitle[2].trim(),
        year: yearThenTitle[1]?.replace(/\s+/g, ""),
      });
      continue;
    }
  }

  const uniqueItems = dedupeDiplomas(
    items.filter((item) => item.label.length > 1),
  );

  if (uniqueItems.length > 0) {
    return uniqueItems;
  }

  return normalized
    .split(/\s*[.;]\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}

function SalaryCard({ member }: { member: SimpleMember }) {
  const diplomaItems = parseDiplomaItems(member.description);

  return (
    <Card className="group mt-10 self-start overflow-visible border-border/45 bg-card/38 shadow-none transition-colors duration-300 hover:bg-card/55 sm:mt-12">
      <CardHeader className="flex flex-col items-center gap-4 p-5 pt-0 text-center">
        <div className="relative -mt-8 h-16 w-16 overflow-hidden rounded-full border border-slate-900/20 bg-background shadow-[0_0_0_3px_rgba(248,250,252,0.86),0_0_0_5px_rgba(15,23,42,0.16)] dark:border-white/25 dark:shadow-[0_0_0_3px_rgba(15,23,42,0.92),0_0_0_5px_rgba(255,255,255,0.16)] sm:-mt-10 sm:h-20 sm:w-20">
          <Image
            src={resolvePhoto(member.photo)}
            alt={member.nom ? `Portrait de ${member.nom}` : "Avatar par défaut"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>

        <div className="space-y-3">
          <Badge
            variant="outline"
            className="gap-2 border-primary/25 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
          >
            <Users className="h-4 w-4" />
            <span>Salarié diplômé</span>
          </Badge>
          <CardTitle className="text-xl">{member.nom}</CardTitle>
        </div>
      </CardHeader>

      {member.description ? (
        <CardContent className="px-5 pb-4 pt-0">
          {diplomaItems.length > 0 ? (
            <div className="mx-auto flex max-w-[20rem] flex-col gap-3 text-left">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85">
                <GraduationCap className="h-4 w-4" />
                <span>Diplômes et certifications</span>
              </div>

              <ul className="space-y-2">
                {diplomaItems.map((item, index) => (
                  <li
                    key={`${item.label}-${item.year ?? "sans-date"}-${index}`}
                    className="rounded-2xl border border-border/60 bg-background/45 px-3 py-2"
                  >
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {item.label}
                    </p>
                    {item.year ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-primary/80">
                        {item.year}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <CardDescription className="mx-auto max-w-[20rem] text-left leading-relaxed">
              {member.description}
            </CardDescription>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}

export default async function SalariesPage() {
  const payload = await getComiteResponse();
  const salaries = payload.data.salaries;

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 pb-28 pt-12 sm:pb-32">
      <Reveal>
        <header className="rounded-[2rem] border border-border/70 bg-card/72 p-8 shadow-sm backdrop-blur-[8px] sm:p-10">
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] animate-fade-up-1">
              Encadrement CCTT
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight animate-fade-up-2 sm:text-5xl">
                Salariés diplômés
              </h1>
              <Badge variant="outline">
                {String(salaries.length).padStart(2, "0")} profil
                {salaries.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="max-w-3xl text-base leading-relaxed text-foreground/88 sm:text-lg">
              Les salariés diplômés accompagnent la pratique sportive, les
              séances et la progression des joueurs au quotidien.
            </p>
          </div>
        </header>
      </Reveal>

      <section className="space-y-14">
        <Reveal>
          <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <h2 className="text-3xl font-semibold">Équipe salariée</h2>
          </div>
        </Reveal>

        {salaries.length === 0 ? (
          <Reveal>
            <Card className="border-dashed bg-card/38 shadow-none">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Aucun salarié n&apos;est encore référencé.
              </CardContent>
            </Card>
          </Reveal>
        ) : (
          <div className="grid items-start grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 sm:gap-y-20 xl:grid-cols-3">
            {salaries.map((salarie, index) => (
              <Reveal key={`${salarie.nom}-${index}`} delay={index * 120}>
                <SalaryCard member={salarie} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
