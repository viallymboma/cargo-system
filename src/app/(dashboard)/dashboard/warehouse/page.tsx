"use client";

import { useState, useEffect } from "react";
import { useMockDataStore } from "@/lib/stores/mock-data-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Warehouse,
  Package,
  QrCode,
  Search,
  MapPin,
  Box,
  Truck,
  Plane,
  Ship,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import type { Shipment, ShipmentStatus } from "@/types/shipment.types";

interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  capacity: number;
  currentStock: number;
  status: "operational" | "maintenance" | "closed";
}

const warehouses: WarehouseLocation[] = [
  {
    id: "wh-china-gz",
    name: "Guangzhou Main Warehouse",
    code: "GZ-01",
    city: "Guangzhou",
    country: "China",
    capacity: 5000,
    currentStock: 0,
    status: "operational",
  },
  {
    id: "wh-china-sh",
    name: "Shanghai Distribution Center",
    code: "SH-01",
    city: "Shanghai",
    country: "China",
    capacity: 3000,
    currentStock: 0,
    status: "operational",
  },
  {
    id: "wh-dubai",
    name: "Dubai Transit Hub",
    code: "DXB-01",
    city: "Dubai",
    country: "UAE",
    capacity: 2000,
    currentStock: 0,
    status: "operational",
  },
  {
    id: "wh-cameroon-dla",
    name: "Douala Main Warehouse",
    code: "DLA-01",
    city: "Douala",
    country: "Cameroon",
    capacity: 3000,
    currentStock: 0,
    status: "operational",
  },
  {
    id: "wh-cameroon-yde",
    name: "Yaounde Distribution Center",
    code: "YDE-01",
    city: "Yaounde",
    country: "Cameroon",
    capacity: 1500,
    currentStock: 0,
    status: "operational",
  },
];

export default function WarehousePage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [warehouseInventory, setWarehouseInventory] = useState<Record<string, Shipment[]>>({});

  const shipments = useMockDataStore((state) => state.shipments);

  useEffect(() => {
    // Group shipments by warehouse status
    const inventory: Record<string, Shipment[]> = {
      "wh-china-gz": [],
      "wh-china-sh": [],
      "wh-dubai": [],
      "wh-cameroon-dla": [],
      "wh-cameroon-yde": [],
    };

    shipments.forEach((shipment) => {
      if (shipment.status === "in_warehouse_china") {
        inventory["wh-china-gz"].push(shipment);
      } else if (shipment.status === "in_warehouse_cameroon") {
        inventory["wh-cameroon-dla"].push(shipment);
      } else if (shipment.status === "customs_clearance") {
        inventory["wh-cameroon-dla"].push(shipment);
      }
    });

    setWarehouseInventory(inventory);
  }, [shipments]);

  const getWarehouseStock = (warehouseId: string) => {
    return warehouseInventory[warehouseId]?.length || 0;
  };

  const getFilteredShipments = () => {
    let filtered = shipments.filter(
      (s) =>
        s.status === "in_warehouse_china" ||
        s.status === "in_warehouse_cameroon" ||
        s.status === "customs_clearance" ||
        s.status === "picked_up"
    );

    if (selectedWarehouse !== "all") {
      const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
      if (warehouse) {
        if (warehouse.country === "China") {
          filtered = filtered.filter(
            (s) => s.status === "in_warehouse_china" || s.status === "picked_up"
          );
        } else if (warehouse.country === "Cameroon") {
          filtered = filtered.filter(
            (s) => s.status === "in_warehouse_cameroon" || s.status === "customs_clearance"
          );
        }
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(term) ||
          s.receiver.name.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;

    setScanning(true);
    try {
      // Simulate scanning delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const shipment = useMockDataStore.getState().getShipmentByTrackingNumber(scanInput.trim());

      if (!shipment) {
        toast.error("Shipment not found");
        return;
      }

      // Determine next status based on current status
      let nextStatus: ShipmentStatus | null = null;
      let description = "";

      switch (shipment.status) {
        case "picked_up":
          nextStatus = "in_warehouse_china";
          description = "Package scanned and received at China warehouse";
          break;
        case "in_warehouse_china":
          nextStatus = "in_transit";
          description = "Package scanned and dispatched for transit";
          break;
        case "in_transit":
          nextStatus = "customs_clearance";
          description = "Package arrived and scanned at customs";
          break;
        case "customs_clearance":
          nextStatus = "in_warehouse_cameroon";
          description = "Package cleared customs, received at Cameroon warehouse";
          break;
        case "in_warehouse_cameroon":
          nextStatus = "out_for_delivery";
          description = "Package scanned and dispatched for delivery";
          break;
        default:
          toast.info(`Package is currently: ${shipment.status}`);
          return;
      }

      if (nextStatus) {
        useMockDataStore.getState().addTrackingEvent({
          shipmentId: shipment.id,
          type: "scan",
          status: nextStatus,
          location: {
            city: selectedWarehouse !== "all"
              ? warehouses.find(w => w.id === selectedWarehouse)?.city || "Unknown"
              : "Douala",
            country: selectedWarehouse !== "all"
              ? warehouses.find(w => w.id === selectedWarehouse)?.country || "Cameroon"
              : "Cameroon",
          },
          description,
        });

        toast.success(`Package scanned! Status: ${nextStatus.replace(/_/g, " ")}`);
        setScanInput("");
      }
    } finally {
      setScanning(false);
    }
  };

  const statusColors: Record<string, string> = {
    picked_up: "bg-indigo-100 text-indigo-800",
    in_warehouse_china: "bg-purple-100 text-purple-800",
    in_transit: "bg-cyan-100 text-cyan-800",
    customs_clearance: "bg-orange-100 text-orange-800",
    in_warehouse_cameroon: "bg-teal-100 text-teal-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
          <p className="text-gray-500">Manage inventory across all warehouses</p>
        </div>
        <Button onClick={() => setScanDialogOpen(true)}>
          <ScanLine className="mr-2 h-4 w-4" />
          Scan Package
        </Button>
      </div>

      {/* Warehouse Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {warehouses.map((warehouse) => (
          <Card
            key={warehouse.id}
            className={`cursor-pointer transition-all ${
              selectedWarehouse === warehouse.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() =>
              setSelectedWarehouse(selectedWarehouse === warehouse.id ? "all" : warehouse.id)
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Warehouse className="h-8 w-8 text-gray-400" />
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    warehouse.status === "operational"
                      ? "bg-green-100 text-green-800"
                      : warehouse.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {warehouse.status}
                </span>
              </div>
              <h3 className="font-semibold">{warehouse.name}</h3>
              <p className="text-sm text-gray-500">
                {warehouse.city}, {warehouse.country}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Inventory</span>
                  <span className="font-medium">{getWarehouseStock(warehouse.id)} packages</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (getWarehouseStock(warehouse.id) / warehouse.capacity) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Awaiting Pickup</p>
                <p className="text-2xl font-bold">
                  {shipments.filter((s) => s.status === "picked_up").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In China Warehouses</p>
                <p className="text-2xl font-bold">
                  {shipments.filter((s) => s.status === "in_warehouse_china").length}
                </p>
              </div>
              <Warehouse className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-2xl font-bold">
                  {shipments.filter((s) => s.status === "in_transit").length}
                </p>
              </div>
              <Plane className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Cameroon Warehouses</p>
                <p className="text-2xl font-bold">
                  {shipments.filter((s) => s.status === "in_warehouse_cameroon").length}
                </p>
              </div>
              <Warehouse className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Warehouse Inventory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredShipments().map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono font-medium">
                    {shipment.trackingNumber}
                  </TableCell>
                  <TableCell>{shipment.receiver.name}</TableCell>
                  <TableCell>
                    {shipment.receiver.city}, {shipment.receiver.country}
                  </TableCell>
                  <TableCell>{shipment.totalWeight} kg</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[shipment.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {shipment.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(shipment.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScanInput(shipment.trackingNumber);
                        setScanDialogOpen(true);
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      Scan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {getFilteredShipments().length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No packages in warehouse
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Scan Dialog */}
      <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                Scan barcode or enter tracking number manually
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="ST-XXXXXXXXXX"
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
            </div>
            <div className="space-y-2">
              <Label>Warehouse Location</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} className="w-full" disabled={scanning}>
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Confirm Scan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
