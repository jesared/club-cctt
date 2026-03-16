import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon profil</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Retrouvez ici vos informations personnelles et les accès rapides à votre espace.
        </p>
      </CardContent>
    </Card>
  );
}
