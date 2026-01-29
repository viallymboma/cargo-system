"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Package,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";
import { toast } from "sonner";

// Define types for report data
type ShipmentByStatus = {
  status: string;
  count: number;
};

type ShipmentByOrigin = {
  origin: string;
  count: number;
};

type RevenueData = {
  period: {
    startDate: string;
    endDate: string;
  };
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
};

type DashboardStats = {
  shipments: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different report data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    shipments: {
      total: 0,
      pending: 0,
      inTransit: 0,
      delivered: 0,
    },
    revenue: {
      total: 0,
      paid: 0,
      pending: 0,
    }
  });
  const [shipmentsByStatus, setShipmentsByStatus] = useState<ShipmentByStatus[]>([]);
  const [shipmentsByOrigin, setShipmentsByOrigin] = useState<ShipmentByOrigin[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [avgDeliveryTime, setAvgDeliveryTime] = useState<number>(0);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all report data
      const [
        dashboardStatsData,
        statusData,
        originData,
        revenueResponse,
        avgTimeData,
      ] = await Promise.all([
        reportsApi.getDashboardStats(),
        reportsApi.getShipmentsByStatus(),
        reportsApi.getShipmentsByOrigin(),
        reportsApi.getRevenue(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString(),
        ),
        reportsApi.getAverageDeliveryTime(),
      ]);

      setDashboardStats(dashboardStatsData);
      setShipmentsByStatus(statusData);
      setShipmentsByOrigin(originData);
      setRevenueData(Array.isArray(revenueResponse) ? revenueResponse : [revenueResponse]);
      setAvgDeliveryTime(avgTimeData);
    } catch (error) {
      console.error("Error loading reports data:", error);
      setError("Erreur lors du chargement des rapports");
      toast.error("Erreur lors du chargement des rapports");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (days: number) => {
    return `${Math.round(days)} jours`;
  };

  // Calculate percentages for shipment status
  const calculatePercentages = (data: ShipmentByStatus[]) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  };

  const shipmentStatusWithPercentages = calculatePercentages(shipmentsByStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-gray-500">
            Analyse des performances et tendances logistiques
          </p>
        </div>
        <Button onClick={loadReportsData}>
          <Download className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total expéditions
            </CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardStats.shipments.total || 0}
            </div>
            <p className="text-xs text-gray-500">+12% ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En transit
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardStats.shipments.inTransit || 0}
            </div>
            <p className="text-xs text-gray-500">8 arrivent aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Livrées
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardStats.shipments.delivered || 0}
            </div>
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
            <div className="text-3xl font-bold">
              {formatCurrency(dashboardStats.revenue.total || 0)}
            </div>
            <p className="text-xs text-gray-500">+8.2% ce mois-ci</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different report sections */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="shipments">Expéditions</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statut des expéditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Erreur: {error}</p>
                    <Button onClick={loadReportsData} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shipmentStatusWithPercentages.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {item.status}
                          </span>
                          <span className="text-sm font-medium">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Expéditions par origine
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Erreur: {error}</p>
                    <Button onClick={loadReportsData} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shipmentsByOrigin.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm font-medium">
                          {item.origin}
                        </span>
                        <span className="text-sm">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Détails des expéditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Erreur: {error}</p>
                  <Button onClick={loadReportsData} className="mt-4">
                    Réessayer
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Statut
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Nombre
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Pourcentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {shipmentStatusWithPercentages.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {item.status}
                          </td>
                          <td className="py-3 px-4">{item.count}</td>
                          <td className="py-3 px-4">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenus par période
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Erreur: {error}</p>
                  <Button onClick={loadReportsData} className="mt-4">
                    Réessayer
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Période
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Factures
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Montant total
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Montant payé
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Montant en attente
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {revenueData?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {new Date(
                              item.period.startDate,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(item.period.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">{item.totalInvoices}</td>
                          <td className="py-3 px-4">
                            {formatCurrency(item.totalAmount)}
                          </td>
                          <td className="py-3 px-4">
                            {formatCurrency(item.paidAmount)}
                          </td>
                          <td className="py-3 px-4">
                            {formatCurrency(item.pendingAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Temps moyen de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Erreur: {error}</p>
                    <Button onClick={loadReportsData} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-blue-600">
                      {formatDuration(avgDeliveryTime)}
                    </div>
                    <p className="text-gray-500 mt-2">
                      Temps moyen de livraison
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Taux de performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Taux de livraison à temps</span>
                    <span className="text-sm font-medium">96.4%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "96.4%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Taux de satisfaction</span>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "94.2%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Taux d'intégrité</span>
                    <span className="text-sm font-medium">98.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "98.7%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
