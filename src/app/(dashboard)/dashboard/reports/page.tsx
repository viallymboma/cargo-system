"use client";

import { useState, useEffect } from "react";
import { useMockDataStore } from "@/lib/stores/mock-data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Clock,
  MapPin,
  Download,
  Calendar,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import type { Shipment } from "@/types/shipment.types";
import type { Invoice } from "@/types/billing.types";

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const store = useMockDataStore.getState();
    setShipments(store.shipments);
    setInvoices(store.invoices);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate statistics
  const stats = {
    totalShipments: shipments.length,
    deliveredShipments: shipments.filter((s) => s.status === "delivered").length,
    inTransitShipments: shipments.filter((s) => s.status === "in_transit").length,
    pendingShipments: shipments.filter(
      (s) => s.status === "pending" || s.status === "confirmed"
    ).length,
    blockedShipments: shipments.filter((s) => s.status === "customs_clearance").length,
    totalRevenue: invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.totalAmount, 0),
    pendingPayments: invoices
      .filter((i) => i.status === "pending" || i.status === "partially_paid")
      .reduce((sum, i) => sum + i.amountDue, 0),
    averageDeliveryDays: 12, // Simulated
    deliveryRate: shipments.length > 0
      ? Math.round((shipments.filter((s) => s.status === "delivered").length / shipments.length) * 100)
      : 0,
  };

  // Shipments by status
  const shipmentsByStatus = [
    { status: "Pending", count: shipments.filter((s) => s.status === "pending").length, color: "bg-yellow-500" },
    { status: "Confirmed", count: shipments.filter((s) => s.status === "confirmed").length, color: "bg-blue-500" },
    { status: "In Warehouse (China)", count: shipments.filter((s) => s.status === "in_warehouse_china").length, color: "bg-purple-500" },
    { status: "In Transit", count: shipments.filter((s) => s.status === "in_transit").length, color: "bg-cyan-500" },
    { status: "Customs", count: shipments.filter((s) => s.status === "customs_clearance").length, color: "bg-orange-500" },
    { status: "In Warehouse (CM)", count: shipments.filter((s) => s.status === "in_warehouse_cameroon").length, color: "bg-teal-500" },
    { status: "Delivered", count: shipments.filter((s) => s.status === "delivered").length, color: "bg-green-500" },
  ];

  // Shipments by type
  const shipmentsByType = [
    { type: "Air Freight", count: shipments.filter((s) => s.type === "air").length, revenue: shipments.filter((s) => s.type === "air").reduce((sum, s) => sum + s.totalCost, 0) },
    { type: "Sea Freight", count: shipments.filter((s) => s.type === "sea").length, revenue: shipments.filter((s) => s.type === "sea").reduce((sum, s) => sum + s.totalCost, 0) },
    { type: "Ground", count: shipments.filter((s) => s.type === "ground").length, revenue: shipments.filter((s) => s.type === "ground").reduce((sum, s) => sum + s.totalCost, 0) },
    { type: "Express", count: shipments.filter((s) => s.type === "express").length, revenue: shipments.filter((s) => s.type === "express").reduce((sum, s) => sum + s.totalCost, 0) },
  ];

  // Top destinations
  const destinationCounts: Record<string, number> = {};
  shipments.forEach((s) => {
    const dest = s.receiver.city;
    destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
  });
  const topDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500">Track performance and business insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Shipments</p>
                <p className="text-2xl font-bold">{stats.totalShipments}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivery Rate</p>
                <p className="text-2xl font-bold">{stats.deliveryRate}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% from last period
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Delivery Time</p>
                <p className="text-2xl font-bold">{stats.averageDeliveryDays} days</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -1.5 days from last period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipments by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Shipments by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipmentsByStatus.map((item) => (
                    <div key={item.status} className="flex items-center">
                      <div className="w-32 text-sm">{item.status}</div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{
                              width: `${stats.totalShipments > 0 ? (item.count / stats.totalShipments) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right font-medium">{item.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipments by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Shipments by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentsByType.map((item) => (
                      <TableRow key={item.type}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Destinations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDestinations.map(([city, count], index) => (
                    <div key={city} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span>{city}</span>
                      </div>
                      <span className="font-medium">{count} shipments</span>
                    </div>
                  ))}
                  {topDestinations.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Delivered</p>
                    <p className="text-2xl font-bold text-green-700">
                      {stats.deliveredShipments}
                    </p>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <p className="text-sm text-cyan-600">In Transit</p>
                    <p className="text-2xl font-bold text-cyan-700">
                      {stats.inTransitShipments}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {stats.pendingShipments}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">At Customs</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {stats.blockedShipments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Shipment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Shipment trend chart</p>
                    <p className="text-sm">(Visualization would go here)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blocked Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipments
                    .filter((s) => s.status === "customs_clearance")
                    .slice(0, 5)
                    .map((shipment) => (
                      <div
                        key={shipment.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                      >
                        <div>
                          <p className="font-mono text-sm">{shipment.trackingNumber}</p>
                          <p className="text-xs text-gray-500">{shipment.receiver.city}</p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      </div>
                    ))}
                  {shipments.filter((s) => s.status === "customs_clearance").length === 0 && (
                    <p className="text-gray-500 text-center py-4">No blocked shipments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Agency</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agency</TableHead>
                      <TableHead className="text-right">Shipments</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">ShipTrack Douala</TableCell>
                      <TableCell className="text-right">
                        {shipments.filter((s) => s.agencyId === "agency-1").length}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          shipments
                            .filter((s) => s.agencyId === "agency-1")
                            .reduce((sum, s) => sum + s.totalCost, 0)
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ShipTrack Yaounde</TableCell>
                      <TableCell className="text-right">
                        {shipments.filter((s) => s.agencyId === "agency-2").length}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          shipments
                            .filter((s) => s.agencyId === "agency-2")
                            .reduce((sum, s) => sum + s.totalCost, 0)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600">Paid Invoices</p>
                      <p className="text-xl font-bold text-green-700">
                        {invoices.filter((i) => i.status === "paid").length}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm text-yellow-600">Pending Payments</p>
                      <p className="text-xl font-bold text-yellow-700">
                        {invoices.filter((i) => i.status === "pending").length}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-yellow-600">
                      {formatCurrency(stats.pendingPayments)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">On-Time Delivery Rate</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "87%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Customer Satisfaction</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Damage Rate</span>
                      <span className="font-medium">2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: "2%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Delivery Time by Route</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Avg. Days</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>China → Douala (Air)</TableCell>
                      <TableCell className="text-right">7 days</TableCell>
                      <TableCell className="text-right text-green-600">
                        <TrendingDown className="h-4 w-4 inline" /> -1d
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>China → Douala (Sea)</TableCell>
                      <TableCell className="text-right">45 days</TableCell>
                      <TableCell className="text-right text-green-600">
                        <TrendingDown className="h-4 w-4 inline" /> -3d
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>China → Yaounde (Air)</TableCell>
                      <TableCell className="text-right">9 days</TableCell>
                      <TableCell className="text-right text-red-600">
                        <TrendingUp className="h-4 w-4 inline" /> +1d
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Dubai → Cameroon</TableCell>
                      <TableCell className="text-right">5 days</TableCell>
                      <TableCell className="text-right text-gray-500">—</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
