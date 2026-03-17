import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TournoiResultatsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Les résultats du tournoi seront publiés ici.</p>
      </CardContent>
    </Card>
  );
}
