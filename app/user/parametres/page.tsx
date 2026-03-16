import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserParametresPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Gérez ici vos préférences et paramètres de compte.</p>
      </CardContent>
    </Card>
  );
}
