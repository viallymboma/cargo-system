"use client";

import { useState, useEffect, useCallback } from "react";
import { shipmentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Package,
  Plane,
  Ship,
  Truck,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Filter,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { Shipment, ShipmentStatus, ShipmentType, UpdateShipmentData } from "@/types/shipment.types";

const statusColors: Record<ShipmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_warehouse_china: "bg-purple-100 text-purple-800",
  in_transit: "bg-cyan-100 text-cyan-800",
  customs_clearance: "bg-orange-100 text-orange-800",
  in_warehouse_cameroon: "bg-teal-100 text-teal-800",
  out_for_delivery: "bg-lime-100 text-lime-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<ShipmentStatus, string> = {
  pending: "En attente",
  confirmed: "Reçu à l'origine",
  in_warehouse_china: "À l'entrepôt d'origine",
  in_transit: "En transit",
  customs_clearance: "Dédouanement",
  in_warehouse_cameroon: "À l'entrepôt de destination",
  out_for_delivery: "En cours de livraison",
  delivered: "Livré",
  cancelled: "Annulé",
  returned: "Retourné",
};

const typeIcons: Record<ShipmentType, React.ReactNode> = {
  air: <Plane className="h-4 w-4" />,
  sea: <Ship className="h-4 w-4" />,
  ground: <Truck className="h-4 w-4" />,
  express: <Plane className="h-4 w-4 text-yellow-600" />,
};

const typeLabels: Record<ShipmentType, string> = {
  air: "Aérien",
  sea: "Maritime",
  ground: "Terrestre",
  express: "Express",
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await shipmentsApi.getShipments({
        page: pagination.page,
        pageSize: 10,
        filters: {
          status: statusFilter !== "all" ? (statusFilter as ShipmentStatus) : undefined,
          search: search || undefined,
        },
      });
      setShipments(result.data);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      });
    } catch {
      toast.error("Échec du chargement des expéditions");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, search]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadShipments();
  };

  const handleDelete = async (id: string) => {
    setShipmentToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!shipmentToDelete) return;
    try {
      await shipmentsApi.deleteShipment(shipmentToDelete);
      toast.success("Expédition supprimée avec succès");
      setIsDeleteOpen(false);
      setShipmentToDelete(null);
      loadShipments();
    } catch {
      toast.error("Échec de la suppression de l&apos;expédition");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expéditions</h1>
          <p className="text-gray-500">Gérer toutes les expéditions et colis</p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle expédition
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Créer une nouvelle expédition</SheetTitle>
            </SheetHeader>
            <CreateShipmentForm
              onSuccess={() => {
                setIsCreateOpen(false);
                loadShipments();
                toast.success("Expédition créée avec succès");
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro de suivi, expéditeur ou destinataire..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                Rechercher
              </Button>
            </form>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Expéditions ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune expédition trouvée
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° de suivi</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Coût</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono font-medium">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {typeIcons[shipment.type]}
                          <span>{typeLabels[shipment.type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{shipment.sender.name}</div>
                          <div className="text-sm text-gray-500">
                            {shipment.sender.city}, {shipment.sender.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{shipment.receiver.name}</div>
                          <div className="text-sm text-gray-500">
                            {shipment.receiver.city}, {shipment.receiver.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[shipment.status]}`}
                        >
                          {statusLabels[shipment.status]}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(shipment.totalCost)}</TableCell>
                      <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setIsViewOpen(true);
                            }}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setIsEditOpen(true);
                            }}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(shipment.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} sur {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Shipment Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent side="right" className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{"Détails de l'expédition"}</SheetTitle>
          </SheetHeader>
          {selectedShipment && (
            <ShipmentDetails shipment={selectedShipment} />
          )}
        </SheetContent>
      </Sheet>
      {/* Edit Shipment Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{"Modifier l'expédition"}</SheetTitle>
          </SheetHeader>
          {selectedShipment && (
            <EditShipmentForm
              shipment={selectedShipment}
              onSuccess={() => {
                setIsEditOpen(false);
                loadShipments();
                toast.success("Expédition mise à jour avec succès");
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-red-600">Confirmer la suppression</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette expédition ? Cette action est irréversible.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="destructive" onClick={confirmDelete} className="w-full">
                Supprimer définitivement
              </Button>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full">
                Annuler
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CreateShipmentForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "air" as ShipmentType,
    packageType: "box" as "box" | "envelope" | "pallet" | "container" | "other",
    sender: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "China",
    },
    receiver: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "Cameroon",
    },
    items: [{ description: "", quantity: 1, weight: 0, unitPrice: 0, category: "" }],
    totalWeight: 0,
    declaredValue: 0,
    insuranceRequired: false,
    signatureRequired: true,
    fragile: false,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await shipmentsApi.createShipment(formData);
      onSuccess();
    } catch {
      toast.error("Échec de la création de l&apos;expédition");
    } finally {
      setLoading(false);
    }
  };

  const updateSender = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sender: { ...prev.sender, [field]: value },
    }));
  };

  const updateReceiver = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      receiver: { ...prev.receiver, [field]: value },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipment Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Type d'expédition"}</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as ShipmentType }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="air">Fret aérien</SelectItem>
              <SelectItem value="sea">Fret maritime</SelectItem>
              <SelectItem value="ground">Terrestre</SelectItem>
              <SelectItem value="express">Express</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type de colis</Label>
          <Select
            value={formData.packageType}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, packageType: v as typeof formData.packageType }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="box">Boîte</SelectItem>
              <SelectItem value="envelope">Enveloppe</SelectItem>
              <SelectItem value="pallet">Palette</SelectItem>
              <SelectItem value="container">Conteneur</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sender Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{"Informations de l'expéditeur"}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={formData.sender.name}
              onChange={(e) => updateSender("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input
              value={formData.sender.phone}
              onChange={(e) => updateSender("phone", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.sender.email}
              onChange={(e) => updateSender("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ville</Label>
            <Input
              value={formData.sender.city}
              onChange={(e) => updateSender("city", e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Adresse</Label>
            <Input
              value={formData.sender.address}
              onChange={(e) => updateSender("address", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Receiver Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Informations du destinataire</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={formData.receiver.name}
              onChange={(e) => updateReceiver("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input
              value={formData.receiver.phone}
              onChange={(e) => updateReceiver("phone", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.receiver.email}
              onChange={(e) => updateReceiver("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ville</Label>
            <Input
              value={formData.receiver.city}
              onChange={(e) => updateReceiver("city", e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Adresse</Label>
            <Input
              value={formData.receiver.address}
              onChange={(e) => updateReceiver("address", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Détails du colis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.items[0].description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  items: [{ ...prev.items[0], description: e.target.value }],
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Input
              value={formData.items[0].category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  items: [{ ...prev.items[0], category: e.target.value }],
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Poids (kg)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={formData.totalWeight}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, totalWeight: parseFloat(e.target.value) || 0 }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Valeur déclarée (XAF)</Label>
            <Input
              type="number"
              min="0"
              value={formData.declaredValue}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, declaredValue: parseFloat(e.target.value) || 0 }))
              }
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.insuranceRequired}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, insuranceRequired: e.target.checked }))
              }
              className="rounded"
            />
            <span className="text-sm">Assurance requise</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.fragile}
              onChange={(e) => setFormData((prev) => ({ ...prev, fragile: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Fragile</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.signatureRequired}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, signatureRequired: e.target.checked }))
              }
              className="rounded"
            />
            <span className="text-sm">Signature requise</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Toutes notes supplémentaires..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création...
          </>
        ) : (
          "Créer l'expédition"
        )}
      </Button>
    </form>
  );
}

function EditShipmentForm({ shipment, onSuccess }: { shipment: Shipment; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateShipmentData>({
    status: shipment.status,
    receiver: {
      name: shipment.receiver.name,
      phone: shipment.receiver.phone,
      email: shipment.receiver.email,
      address: shipment.receiver.address,
      city: shipment.receiver.city,
    },
    notes: shipment.notes,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await shipmentsApi.updateShipment(shipment.id, formData);
      onSuccess();
    } catch {
      toast.error("Échec de la mise à jour de l&apos;expédition");
    } finally {
      setLoading(false);
    }
  };

  const updateReceiver = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      receiver: { ...prev.receiver, [field]: value },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as ShipmentStatus }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date de livraison estimée</Label>
          <Input
            type="date"
            value={formData.estimatedDeliveryDate?.split("T")[0] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, estimatedDeliveryDate: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Receiver Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Informations du destinataire</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={formData.receiver?.name || ""}
              onChange={(e) => updateReceiver("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input
              value={formData.receiver?.phone || ""}
              onChange={(e) => updateReceiver("phone", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.receiver?.email || ""}
              onChange={(e) => updateReceiver("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ville</Label>
            <Input
              value={formData.receiver?.city || ""}
              onChange={(e) => updateReceiver("city", e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Adresse</Label>
            <Input
              value={formData.receiver?.address || ""}
              onChange={(e) => updateReceiver("address", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes / Description</Label>
        <Input
          value={formData.notes || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Toutes notes supplémentaires..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mise à jour...
          </>
        ) : (
          "Mettre à jour l'expédition"
        )}
      </Button>
    </form>
  );
}

function ShipmentDetails({ shipment }: { shipment: Shipment }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
        <div>
          <p className="text-sm text-gray-500">Numéro de suivi</p>
          <p className="text-2xl font-mono font-bold text-primary-700">{shipment.trackingNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${statusColors[shipment.status]}`}
          >
            {statusLabels[shipment.status]}
          </span>
          {shipment.type && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">
              {typeIcons[shipment.type]}
              {typeLabels[shipment.type]}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Contacts and Dates */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Expéditeur
              </h4>
              <div className="text-sm space-y-2">
                <p className="font-bold text-gray-950">{shipment.sender.name}</p>
                <div className="space-y-1">
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-[10px] w-4 mt-0.5">TEL</span> {shipment.sender.phone}
                  </p>
                  {shipment.sender.email && (
                    <p className="text-gray-600 flex items-center gap-2 truncate">
                      <span className="text-gray-400 font-bold text-[10px] w-4 mt-0.5">MAIL</span> {shipment.sender.email}
                    </p>
                  )}
                </div>
                <div className="pt-1 text-gray-600">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Adresse</p>
                  <p className="leading-relaxed">
                    {shipment.sender.address}<br />
                    {shipment.sender.city}{shipment.sender.province ? `, ${shipment.sender.province}` : ""}<br />
                    <span className="font-medium text-gray-900">{shipment.sender.country}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Destinataire
              </h4>
              <div className="text-sm space-y-2">
                <p className="font-bold text-gray-950">{shipment.receiver.name}</p>
                <div className="space-y-1">
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-[10px] w-4 mt-0.5">TEL</span> {shipment.receiver.phone}
                  </p>
                  {shipment.receiver.email && (
                    <p className="text-gray-600 flex items-center gap-2 truncate">
                      <span className="text-gray-400 font-bold text-[10px] w-4 mt-0.5">MAIL</span> {shipment.receiver.email}
                    </p>
                  )}
                </div>
                <div className="pt-1 text-gray-600">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Adresse</p>
                  <p className="leading-relaxed">
                    {shipment.receiver.address}<br />
                    {shipment.receiver.city}{shipment.receiver.region ? `, ${shipment.receiver.region}` : ""}<br />
                    <span className="font-medium text-gray-900">{shipment.receiver.country}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              Chronologie
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Créé le</p>
                <p className="font-medium">{formatDate(shipment.createdAt)}</p>
              </div>
              {shipment.estimatedDeliveryDate && (
                <div className="bg-blue-50/50 p-2 rounded">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Estime le</p>
                  <p className="font-medium text-blue-700">{formatDate(shipment.estimatedDeliveryDate)}</p>
                </div>
              )}
              {shipment.actualDeliveryDate && (
                <div className="bg-green-50 p-2 rounded col-span-2 border border-green-100">
                  <p className="text-[10px] font-bold text-green-400 uppercase">Livré le</p>
                  <p className="font-medium text-green-700">{formatDate(shipment.actualDeliveryDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Package and Costs */}
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              Détails Logistiques
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Emballage</p>
                <p className="font-medium capitalize">{shipment.packageType || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Poids Réel</p>
                <p className="font-medium">{shipment.totalWeight} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Valeur</p>
                <p className="font-medium">{formatCurrency(shipment.declaredValue || 0)}</p>
              </div>
              {shipment.dimensions && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dimensions</p>
                  <p className="font-medium">{shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height} cm</p>
                </div>
              )}
              {shipment.volumetricWeight && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Poids Vol.</p>
                  <p className="font-medium">{shipment.volumetricWeight.toFixed(2)} kg</p>
                </div>
              )}
              {shipment.chargeableWeight && (
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Poids Taxable</p>
                  <p className="font-bold text-blue-600">{shipment.chargeableWeight.toFixed(2)} kg</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant={shipment.fragile ? "destructive" : "outline"} className="text-[10px]">
                {shipment.fragile ? "⚠ Fragile" : "Non fragile"}
              </Badge>
              <Badge variant={shipment.insuranceRequired ? "default" : "outline"} className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                {shipment.insuranceRequired ? "🛡 Assuré" : "Sans assurance"}
              </Badge>
              <Badge variant={shipment.signatureRequired ? "default" : "outline"} className="text-[10px] bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                {shipment.signatureRequired ? "✍ Signature" : "Sans signature"}
              </Badge>
            </div>
          </div>

          <div className="p-4 bg-primary-50/50 rounded-lg border border-primary-100 shadow-sm group">
            <h4 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary-400" />
              Récapitulatif Financier
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Services de transport</span>
                <span className="font-medium text-gray-900">{formatCurrency(shipment.shippingCost)}</span>
              </div>
              {shipment.insuranceCost && shipment.insuranceCost > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Couverture assurance</span>
                  <span className="font-medium text-gray-900">{formatCurrency(shipment.insuranceCost)}</span>
                </div>
              )}
              {shipment.customsDuty && shipment.customsDuty > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Droits & Taxes douanières</span>
                  <span className="font-medium text-gray-900">{formatCurrency(shipment.customsDuty)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-primary-200 pt-3 text-primary-800 text-lg">
                <span>Total à régler</span>
                <span>{formatCurrency(shipment.totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Bottom Section: Items and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t pt-6">
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 italic">
            <Package className="h-4 w-4" />
            Inventaire des articles
          </h4>
          {shipment.items && shipment.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shipment.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{item.description}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary-600">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    <p className="text-xs text-gray-400">{item.weight} kg</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 italic">Aucun article détaillé enregistré.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 italic">
            <FileText className="h-4 w-4" />
            Observations
          </h4>
          <div className="space-y-3">
            {shipment.notes && (
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Notes Générales</p>
                <p className="text-sm text-gray-700 leading-relaxed">{shipment.notes}</p>
              </div>
            )}
            {shipment.specialInstructions && (
              <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-100">
                <p className="text-[10px] font-bold text-yellow-500 uppercase mb-1">Instructions Spéciales</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{shipment.specialInstructions}</p>
              </div>
            )}
            {!shipment.notes && !shipment.specialInstructions && (
              <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded border border-dashed">
                Aucune note particulière.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
