import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserPaiementsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes paiements</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Le suivi de vos paiements sera affiché ici.</p>
      </CardContent>
    </Card>
  );
}
