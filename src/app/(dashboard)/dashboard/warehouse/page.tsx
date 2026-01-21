"use client";

import { useState, useEffect, useCallback } from "react";
import { warehouseApi, trackingApi, shipmentsApi } from "@/lib/api";
import type { WarehouseInventoryItem } from "@/lib/api/warehouse";
import type { FrontendWarehouse } from "@/lib/api/adapters";
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
import {
  Warehouse,
  Package,
  QrCode,
  Search,
  Plane,
  Loader2,
  ScanLine,
  RefreshCw,
  Plus,
  Edit,
  Power,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";
import type { Shipment, ShipmentStatus } from "@/types/shipment.types";

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<FrontendWarehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [inventory, setInventory] = useState<WarehouseInventoryItem[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWarehouseForEdit, setSelectedWarehouseForEdit] = useState<FrontendWarehouse | null>(null);

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await warehouseApi.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      toast.error("Erreur lors du chargement des entrepôts");
    }
  }, []);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    try {
      const filters: { warehouseId?: string; isInWarehouse?: boolean } = { isInWarehouse: true };
      if (selectedWarehouse !== "all") {
        filters.warehouseId = selectedWarehouse;
      }
      const data = await warehouseApi.getInventory(filters);
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Erreur lors du chargement de l'inventaire");
    }
  }, [selectedWarehouse]);

  // Fetch shipments for warehouse statuses
  const fetchShipments = useCallback(async () => {
    try {
      const result = await shipmentsApi.getShipments({});
      setShipments(result.data);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWarehouses(), fetchShipments()]);
      setLoading(false);
    };
    loadData();
  }, [fetchWarehouses, fetchShipments]);

  // Reload inventory when warehouse changes
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchWarehouses(), fetchInventory(), fetchShipments()]);
    setLoading(false);
    toast.success("Données actualisées");
  };

  const getWarehouseStock = (warehouseId: string) => {
    return inventory.filter((item) => item.warehouseId === warehouseId && item.isInWarehouse).length;
  };

  const getFilteredShipments = () => {
    let filtered = shipments.filter(
      (s) =>
        s.status === "in_warehouse_china" ||
        s.status === "in_warehouse_cameroon" ||
        s.status === "customs_clearance" ||
        s.status === "confirmed"
    );

    if (selectedWarehouse !== "all") {
      const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
      if (warehouse) {
        if (warehouse.country === "China" || warehouse.country === "Chine") {
          filtered = filtered.filter(
            (s) => s.status === "in_warehouse_china" || s.status === "confirmed"
          );
        } else if (warehouse.country === "Cameroon" || warehouse.country === "Cameroun") {
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
      // First try to find by QR code or barcode
      let inventoryItem = await warehouseApi.scanQrCode(scanInput.trim());
      if (!inventoryItem) {
        inventoryItem = await warehouseApi.scanBarcode(scanInput.trim());
      }

      // If not found in inventory, search in shipments by tracking number
      const shipment = shipments.find(
        (s) => s.trackingNumber.toLowerCase() === scanInput.trim().toLowerCase()
      );

      if (!shipment && !inventoryItem) {
        toast.error("Colis non trouvé");
        return;
      }

      const targetShipment = shipment || (inventoryItem ? shipments.find(s => s.id === inventoryItem!.shipmentId) : null);

      if (!targetShipment) {
        toast.error("Expédition non trouvée");
        return;
      }

      // Determine next status based on current status
      let nextStatus: ShipmentStatus | null = null;
      let description = "";
      let location = { city: "Douala", country: "Cameroon" };

      if (selectedWarehouse !== "all") {
        const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
        if (warehouse) {
          location = { city: warehouse.city, country: warehouse.country };
        }
      }

      switch (targetShipment.status) {
        case "confirmed":
          nextStatus = "in_warehouse_china";
          description = "Colis scanné et reçu à l'entrepôt d'origine";
          break;
        case "in_warehouse_china":
          nextStatus = "in_transit";
          description = "Colis scanné et expédié pour transit";
          break;
        case "in_transit":
          nextStatus = "customs_clearance";
          description = "Colis arrivé et scanné aux douanes";
          break;
        case "customs_clearance":
          nextStatus = "in_warehouse_cameroon";
          description = "Colis dédouané, reçu à l'entrepôt de destination";
          break;
        case "in_warehouse_cameroon":
          nextStatus = "out_for_delivery";
          description = "Colis scanné et envoyé pour livraison";
          break;
        default:
          toast.info(`Le colis est actuellement: ${targetShipment.status.replace(/_/g, " ")}`);
          return;
      }

      if (nextStatus) {
        await trackingApi.updateShipmentStatus(
          targetShipment.id,
          nextStatus,
          location,
          description
        );

        toast.success(`Colis scanné! Statut: ${nextStatus.replace(/_/g, " ")}`);
        setScanInput("");
        await refreshData();
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Erreur lors du scan");
    } finally {
      setScanning(false);
    }
  };

  const handleActivateWarehouse = async (id: string) => {
    try {
      await warehouseApi.activateWarehouse(id);
      toast.success("Entrepôt activé");
      await fetchWarehouses();
    } catch (error) {
      console.error("Failed to activate warehouse:", error);
      toast.error("Erreur lors de l'activation");
    }
  };

  const handleDeactivateWarehouse = async (id: string) => {
    try {
      await warehouseApi.deactivateWarehouse(id);
      toast.success("Entrepôt désactivé");
      await fetchWarehouses();
    } catch (error) {
      console.error("Failed to deactivate warehouse:", error);
      toast.error("Erreur lors de la désactivation");
    }
  };

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-800",
    in_warehouse_china: "bg-purple-100 text-purple-800",
    in_transit: "bg-cyan-100 text-cyan-800",
    customs_clearance: "bg-orange-100 text-orange-800",
    in_warehouse_cameroon: "bg-teal-100 text-teal-800",
  };

  const statusLabels: Record<string, string> = {
    confirmed: "Confirmé",
    in_warehouse_china: "Entrepôt Chine",
    in_transit: "En transit",
    customs_clearance: "Dédouanement",
    in_warehouse_cameroon: "Entrepôt Cameroun",
    out_for_delivery: "En livraison",
    delivered: "Livré",
  };

  if (loading && warehouses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Entrepôts</h1>
          <p className="text-gray-500">Gérer l'inventaire de tous les entrepôts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Entrepôt
          </Button>
          <Button onClick={() => setScanDialogOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" />
            Scanner un Colis
          </Button>
        </div>
      </div>

      {/* Warehouse Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((warehouse) => (
          <Card
            key={warehouse.id}
            className={`cursor-pointer transition-all ${
              selectedWarehouse === warehouse.id ? "ring-2 ring-blue-500" : ""
            } ${!warehouse.isActive ? "opacity-60" : ""}`}
            onClick={() =>
              setSelectedWarehouse(selectedWarehouse === warehouse.id ? "all" : warehouse.id)
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Warehouse className="h-8 w-8 text-gray-400" />
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      warehouse.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {warehouse.isActive ? "Actif" : "Inactif"}
                  </span>
                  <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setSelectedWarehouseForEdit(warehouse);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {warehouse.isActive ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeactivateWarehouse(warehouse.id)}
                      >
                        <PowerOff className="h-3 w-3 text-orange-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleActivateWarehouse(warehouse.id)}
                      >
                        <Power className="h-3 w-3 text-green-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold">{warehouse.name}</h3>
              <p className="text-sm text-gray-500">
                {warehouse.city}, {warehouse.country}
              </p>
              <p className="text-xs text-gray-400 font-mono">{warehouse.code}</p>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Inventaire</span>
                  <span className="font-medium">{getWarehouseStock(warehouse.id)} colis</span>
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
                <p className="text-xs text-gray-400 mt-1">
                  Capacité: {warehouse.capacity}
                </p>
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
                <p className="text-sm text-gray-500">Reçus à l'origine</p>
                <p className="text-2xl font-bold">
                  {shipments.filter((s) => s.status === "confirmed").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entrepôts Chine</p>
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
                <p className="text-sm text-gray-500">En Transit</p>
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
                <p className="text-sm text-gray-500">Entrepôts Cameroun</p>
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
            <CardTitle>Inventaire des Entrepôts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des colis..."
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
                <TableHead>N° Suivi</TableHead>
                <TableHead>Destinataire</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Reçu le</TableHead>
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
                      {statusLabels[shipment.status] || shipment.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(shipment.updatedAt).toLocaleDateString("fr-FR")}
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
                      Scanner
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {getFilteredShipments().length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun colis dans l'entrepôt
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
            <DialogTitle>Scanner un Colis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                Scannez le code-barres ou entrez le numéro de suivi manuellement
              </p>
            </div>
            <div className="space-y-2">
              <Label>Numéro de Suivi</Label>
              <Input
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="ST-XXXXXXXXXX"
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
            </div>
            <div className="space-y-2">
              <Label>Emplacement de l'Entrepôt</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un entrepôt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les entrepôts</SelectItem>
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
                  Traitement...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Confirmer le Scan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Warehouse Dialog */}
      <CreateWarehouseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          fetchWarehouses();
          setCreateDialogOpen(false);
        }}
      />

      {/* Edit Warehouse Dialog */}
      {selectedWarehouseForEdit && (
        <EditWarehouseDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          warehouse={selectedWarehouseForEdit}
          onSuccess={() => {
            fetchWarehouses();
            setEditDialogOpen(false);
            setSelectedWarehouseForEdit(null);
          }}
        />
      )}
    </div>
  );
}

// Create Warehouse Dialog Component
function CreateWarehouseDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    capacity: 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await warehouseApi.createWarehouse(formData);
      toast.success("Entrepôt créé avec succès");
      onSuccess();
      setFormData({
        name: "",
        code: "",
        city: "",
        country: "",
        address: "",
        phone: "",
        email: "",
        capacity: 1000,
      });
    } catch (error) {
      console.error("Failed to create warehouse:", error);
      toast.error("Erreur lors de la création de l'entrepôt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un Nouvel Entrepôt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Entrepôt Principal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="WH-001"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Douala"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Cameroun"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Rue Principale"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+237 6XX XXX XXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="entrepot@dhl.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Capacité</Label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              placeholder="1000"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Warehouse Dialog Component
function EditWarehouseDialog({
  open,
  onOpenChange,
  warehouse,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: FrontendWarehouse;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: warehouse.name,
    code: warehouse.code,
    city: warehouse.city,
    country: warehouse.country,
    address: warehouse.address,
    phone: warehouse.phone,
    email: warehouse.email,
    capacity: warehouse.capacity,
  });

  useEffect(() => {
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      city: warehouse.city,
      country: warehouse.country,
      address: warehouse.address,
      phone: warehouse.phone,
      email: warehouse.email,
      capacity: warehouse.capacity,
    });
  }, [warehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await warehouseApi.updateWarehouse(warehouse.id, formData);
      toast.success("Entrepôt mis à jour avec succès");
      onSuccess();
    } catch (error) {
      console.error("Failed to update warehouse:", error);
      toast.error("Erreur lors de la mise à jour de l'entrepôt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'Entrepôt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Capacité</Label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
