import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TournoiClassementsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Classements</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Les classements du tournoi seront affichés ici.</p>
      </CardContent>
    </Card>
  );
}
