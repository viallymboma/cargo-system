import Link from "next/link";
import { Package, Truck, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DHL CARGO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/login">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-4">
                <Package className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-5xl font-bold text-gray-900">
              DHL CARGO
            </h1>
            <p className="mb-2 text-xl text-gray-600">
              Plateforme de Gestion Logistique
            </p>
            <p className="mb-8 text-lg text-gray-500">
              Suivez et gérez vos expéditions de la Chine au Cameroun
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  <MapPin className="h-5 w-5" />
                  Suivre l'Expédition
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Accéder au Tableau de Bord
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Pourquoi Choisir DHL CARGO ?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Suivi en Temps Réel</h3>
                <p className="text-gray-600">
                  Suivez vos expéditions en temps réel du ramassage à la livraison
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Livraison Rapide</h3>
                <p className="text-gray-600">
                  Options de fret aérien et maritime pour répondre à vos besoins
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Sécurisé et Assuré</h3>
                <p className="text-gray-600">
                  Vos colis sont protégés par une assurance complète
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 DHL CARGO. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
