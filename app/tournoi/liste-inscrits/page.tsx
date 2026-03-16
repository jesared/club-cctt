import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ListeInscritsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des inscrits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          La liste publique des inscrits sera publiée ici après validation des engagements.
        </p>
      </CardContent>
    </Card>
  );
}
