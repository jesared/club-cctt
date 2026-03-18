import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

type Winner = {
  nom: string;
  club: string;
};

type TableauResult = {
  code: string;
  label: string;
  winner?: Winner;
};

type PalmaresYear = {
  annee: number;
  tc?: Winner;
  dames?: Winner;
  tableaux: TableauResult[];
};

const palmaresRecents: PalmaresYear[] = [
  {
    annee: 2025,
    tc: { nom: "REMBERT Bastien", club: "LOUPS ANGERS TT" },
    dames: { nom: "ZHAO Dongyi", club: "ANNECY TT" },
    tableaux: [
      {
        code: "A",
        label: "-800",
        winner: { nom: "NOUGER Valentin", club: "ULLY ST G. FR" },
      },
      {
        code: "B",
        label: "-1100",
        winner: { nom: "SCHWITZGABEL Lara", club: "LEVALLOIS" },
      },
      {
        code: "C",
        label: "-1400",
        winner: { nom: "GABARD Romain", club: "CHATENAY ASVTT" },
      },
      {
        code: "D",
        label: "-1700",
        winner: { nom: "CHAUMERON Mathieu", club: "AS DOMATS SENS TT" },
      },
      {
        code: "E",
        label: "-900",
        winner: { nom: "LELY Gabriel", club: "ILLKIRCH" },
      },
      {
        code: "F",
        label: "-1200",
        winner: { nom: "BOSCUS Soren", club: "ECULLY TT" },
      },
      {
        code: "G",
        label: "-1500",
        winner: { nom: "BORNAREL Selim", club: "USKB" },
      },
      {
        code: "H",
        label: "-1800",
        winner: { nom: "DENIS Franck", club: "NANGIS TT" },
      },
      {
        code: "I",
        label: "NC à N°400",
        winner: { nom: "ZHAO Dongyi", club: "ANNECY TT" },
      },
      {
        code: "J",
        label: "Dames TC",
        winner: { nom: "ZHAO Dongyi", club: "ANNECY TT" },
      },
    ],
  },
  {
    annee: 2024,
    tc: { nom: "SALIFOU Abdel-Kader", club: "ORTT" },
    dames: { nom: "MARTEAU Bérenice", club: "NARBONNE" },
    tableaux: [
      {
        code: "A",
        label: "-800",
        winner: { nom: "DIEBOLD Jarod", club: "SCHILTIGHEIM SU" },
      },
      {
        code: "B",
        label: "-1100",
        winner: { nom: "HERBRECHT Martin", club: "STRASBOURG" },
      },
      {
        code: "C",
        label: "-1400",
        winner: { nom: "TINANT Jeremy", club: "NEUILLY" },
      },
      {
        code: "D",
        label: "-1700",
        winner: { nom: "IVANCIU Florin-Valentin", club: "HERBLAY" },
      },
      {
        code: "I",
        label: "NC à N°400",
        winner: { nom: "MARTEAU Bérenice", club: "NARBONNE" },
      },
      {
        code: "J",
        label: "Dames TC",
        winner: { nom: "MARTEAU Bérenice", club: "NARBONNE" },
      },
      {
        code: "P",
        label: "TC",
        winner: { nom: "SALIFOU Abdel-Kader", club: "ORTT" },
      },
    ],
  },
  {
    annee: 2023,
    tc: { nom: "MARTIN Simeon", club: "METZ TT" },
    dames: { nom: "SALPIN Anais", club: "ALCL GD QUEV." },
    tableaux: [
      {
        code: "A",
        label: "-800",
        winner: { nom: "VAROQUEAUX Axel", club: "MOURMELON TT" },
      },
      {
        code: "B",
        label: "-1100",
        winner: { nom: "CALENDRIER Leopold", club: "VGA ST MAUR US" },
      },
      {
        code: "C",
        label: "-1400",
        winner: { nom: "VUILLEUMIER Lucas", club: "NANCY S.L.U.C." },
      },
      {
        code: "D",
        label: "-1700",
        winner: { nom: "CAUJOLLE Valentin", club: "CSTT" },
      },
      {
        code: "I",
        label: "NC à N°400",
        winner: { nom: "SALPIN Anais", club: "ALCL GD QUEV." },
      },
      {
        code: "J",
        label: "Dames TC",
        winner: { nom: "SALPIN Anais", club: "ALCL GD QUEV." },
      },
      {
        code: "P",
        label: "TC",
        winner: { nom: "MARTIN Simeon", club: "METZ TT" },
      },
    ],
  },
  {
    annee: 2022,
    tc: { nom: "CHOBEAU Clement", club: "CHARLEVILLE MEZ" },
    dames: { nom: "KOCH Julia", club: "METZ TT" },
    tableaux: [
      {
        code: "A",
        label: "-800",
        winner: { nom: "RENARD Baptiste", club: "VAUX TTC" },
      },
      {
        code: "B",
        label: "-1100",
        winner: { nom: "PERRET Max", club: "COULOMMIERS TT" },
      },
      {
        code: "C",
        label: "-1400",
        winner: { nom: "PETITJEAN Nour", club: "NICE CAVIGAL TT" },
      },
      {
        code: "I",
        label: "NC à N°400",
        winner: { nom: "ERHART Maurice", club: "MULHOUSE TT" },
      },
      {
        code: "J",
        label: "Dames TC",
        winner: { nom: "KOCH Julia", club: "METZ TT" },
      },
      {
        code: "P",
        label: "TC",
        winner: { nom: "CHOBEAU Clement", club: "CHARLEVILLE MEZ" },
      },
    ],
  },
];

const archivesTc = [
  {
    annee: 2019,
    tc: "SALIFOU Abdel kader (BCL OISE TT)",
    dames: "LEGRY Clémence (CHALONS-EN-C TT)",
  },
  {
    annee: 2018,
    tc: "LE BRETON Thomas (ISSEENNE E P)",
    dames: "ZHAO Dongyi (LYS LM CP)",
  },
  {
    annee: 2017,
    tc: "DE SAINTILAN Mathieu (LEVALLOIS SPORT)",
    dames: "ZHAO Dongyi (ANNECY TT)",
  },
  {
    annee: 2016,
    tc: "SALIFOU Abdel kader (LA ROMAGNE)",
    dames: "NIVELLE Elodie (BEAUFOU)",
  },
  { annee: 2015, tc: "MEROTOHUN M (Argentan)", dames: "CHASSELIN P (Serris)" },
  {
    annee: 2014,
    tc: "CHEN Jian (Istres)",
    dames: "MATTENET Audrey (St Denis)",
  },
  {
    annee: 2013,
    tc: "ROBINOT Quentin (Levallois)",
    dames: "JAFFEUX Emilie (Etival)",
  },
  { annee: 2012, tc: "LIN JU (Cestas)", dames: "LUCENKOVA Viktoria (O Reims)" },
  { annee: 2011, tc: "LIN JU (Cestas)", dames: "XIAO Qiwen (Gd Quevilly)" },
  { annee: 2010, tc: "LIN JU (Cestas)", dames: "HAO Tong (O Reims)" },
  { annee: 2009, tc: "RUOTING Ye (Issy)", dames: "HAO Tong (O Reims)" },
];

export default function TournoiPalmaresPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="mb-2 space-y-2">
        <h1 className="text-2xl font-semibold">Palmarès du tournoi</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez les vainqueurs des tableaux récents et les archives du
          tournoi national de Pâques du CCTT.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="space-y-1">
              <p className="text-muted-foreground text-xs">
                Vainqueur TC {palmaresRecents[0]?.annee}
              </p>{" "}
              <span>{palmaresRecents[0]?.tc?.nom ?? "—"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src="/palmares/rembert.jpg"
                alt="Vainqueur TC"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="space-y-1">
              <p className="text-muted-foreground text-xs">
                Vainqueure Dames TC {palmaresRecents[0]?.annee}
              </p>{" "}
              <span>{palmaresRecents[0]?.dames?.nom ?? "—"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src="/palmares/zhao.jpg"
                alt="Vainqueure TC Dames"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="space-y-1">
              <p className="text-muted-foreground text-xs">
                Vainqueur TC {palmaresRecents[1]?.annee}
              </p>
              <span>{palmaresRecents[1]?.tc?.nom ?? "—"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src="/palmares/salifou.jpg"
                alt="Vainqueur TC"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="space-y-1">
              <p className="text-muted-foreground text-xs">
                Vainqueure Dames TC {palmaresRecents[1]?.annee}
              </p>
              <span>{palmaresRecents[1]?.dames?.nom ?? "—"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src="/palmares/marteau.jpg"
                alt="Vainqueure TC Dames"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Résumé par année (2022 → 2025)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Année</th>
                  <th className="py-3 pr-4 font-medium">TC</th>
                  <th className="py-3 font-medium">Dames TC</th>
                </tr>
              </thead>
              <tbody>
                {palmaresRecents.map((entree) => (
                  <tr key={entree.annee} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{entree.annee}</td>
                    <td className="py-3 pr-4">
                      <p>{entree.tc?.nom ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {entree.tc?.club ?? "—"}
                      </p>
                    </td>
                    <td className="py-3">
                      <p>{entree.dames?.nom ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {entree.dames?.club ?? "—"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        {palmaresRecents.map((annee) => (
          <Card key={annee.annee}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Palmarès {annee.annee}</CardTitle>
              <Badge variant="secondary">
                {annee.tableaux.length} tableaux renseignés
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {annee.tableaux.map((tableau) => (
                  <li
                    key={`${annee.annee}-${tableau.code}`}
                    className="rounded-md border p-2"
                  >
                    <p className="font-medium">
                      {tableau.code} · {tableau.label}
                    </p>
                    <p className="text-muted-foreground">
                      {tableau.winner
                        ? `${tableau.winner.nom} (${tableau.winner.club})`
                        : "Non communiqué"}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Archives TC & Dames TC (2009 → 2019)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            2020 et 2021 : pas de tournoi.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Année</th>
                  <th className="py-3 pr-4 font-medium">Vainqueur TC</th>
                  <th className="py-3 font-medium">Vainqueure Dames TC</th>
                </tr>
              </thead>
              <tbody>
                {archivesTc.map((entry) => (
                  <tr key={entry.annee} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{entry.annee}</td>
                    <td className="py-3 pr-4">{entry.tc}</td>
                    <td className="py-3">{entry.dames}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Source des données :{" "}
            <Link
              href="https://tournoi.cctt.fr/palmares/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              tournoi.cctt.fr/palmares
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
