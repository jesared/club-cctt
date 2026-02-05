import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

import { User, Users } from "lucide-react";

export default function ComiteDirecteurPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Comité directeur</h1>
        <p className="text-gray-600 max-w-3xl">
          Le comité directeur du Châlons-en-Champagne Tennis de Table assure la
          gestion, l’organisation et le développement du club.
        </p>
      </header>

      {/* BUREAU */}
      <section>
        <h2 className="text-3xl font-semibold mb-10">Bureau</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* PRÉSIDENT */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-col items-center text-center gap-4">
              <div className="relative w-28 h-28 overflow-hidden rounded-lg">
                <Image
                  src="/comite/julie_Fila_Tournant.jpg"
                  alt="FILA-TOURNANT Julie – Présidente du CCTT"
                  fill
                  className="object-cover"
                />
              </div>
              <CardTitle>Présidente</CardTitle>
            </CardHeader>

            <CardContent className="text-center">
              <p className="font-medium">FILA-TOURNANT Julie</p>
              <p className="text-sm text-gray-500">
                Représentation et orientation du club
              </p>
            </CardContent>
          </Card>

          {/* SECRÉTAIRE */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <CardTitle>Secrétaire</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Nom Prénom</p>
              <p className="text-sm text-gray-500">
                Gestion administrative et communication
              </p>
            </CardContent>
          </Card>

          {/* TRÉSORIER */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <CardTitle>Trésorier</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Nom Prénom</p>
              <p className="text-sm text-gray-500">
                Gestion financière du club
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MEMBRES */}
      <section>
        <h2 className="text-3xl font-semibold mb-10">Membres du comité</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <CardTitle>Membre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Nom Prénom</p>
              <p className="text-sm text-gray-500">
                Soutien aux actions du club
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <CardTitle>Membre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Nom Prénom</p>
              <p className="text-sm text-gray-500">
                Organisation des événements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <CardTitle>Membre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Nom Prénom</p>
              <p className="text-sm text-gray-500">Logistique et vie du club</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
