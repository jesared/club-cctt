import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes documents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Vos documents et justificatifs seront disponibles ici.</p>
      </CardContent>
    </Card>
  );
}
