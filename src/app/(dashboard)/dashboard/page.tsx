"use client";

import { useEffect, useState } from "react";
import { useMockDataStore } from "@/lib/stores/mock-data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0, revenue: 0 });
  const shipments = useMockDataStore((state) => state.shipments);

  useEffect(() => {
    const statistics = useMockDataStore.getState().getStatistics();
    setStats(statistics);
  }, [shipments]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M XAF`;
    }
    return `${(amount / 1000).toFixed(0)}K XAF`;
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur ShipTrack</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total expéditions
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-gray-500">+12% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                En transit
              </CardTitle>
              <Truck className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inTransit}</div>
              <p className="text-xs text-gray-500">8 arrivent aujourd'hui</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Livrées
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-gray-500">96.4% taux de réussite</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Chiffre d'affaires
              </CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.revenue)}</div>
              <p className="text-xs text-gray-500">+8.2% par rapport au mois dernier</p>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Expéditions récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "ST-202401-01",
                  status: "En transit",
                  statusColor: "text-purple-600 bg-purple-100",
                  destination: "Douala, Cameroun",
                  date: "Il y a 2 heures",
                },
                {
                  id: "ST-202401-02",
                  status: "Livrée",
                  statusColor: "text-green-600 bg-green-100",
                  destination: "Yaoundé, Cameroun",
                  date: "Il y a 5 heures",
                },
                {
                  id: "ST-202401-03",
                  status: "Douanes",
                  statusColor: "text-yellow-600 bg-yellow-100",
                  destination: "Bafoussam, Cameroun",
                  date: "Il y a 1 jour",
                },
                {
                  id: "ST-202401-04",
                  status: "En attente",
                  statusColor: "text-gray-600 bg-gray-100",
                  destination: "Bamenda, Cameroun",
                  date: "Il y a 2 jours",
                },
              ].map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{shipment.id}</p>
                      <p className="text-sm text-gray-500">
                        {shipment.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${shipment.statusColor}`}
                    >
                      {shipment.status}
                    </span>
                    <span className="text-sm text-gray-500">{shipment.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
