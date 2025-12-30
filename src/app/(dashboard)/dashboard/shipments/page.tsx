"use client";

import { useState, useEffect } from "react";
import { shipmentsApi } from "@/lib/api";
import { useMockDataStore } from "@/lib/stores/mock-data-store";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";
import type { Shipment, ShipmentStatus, ShipmentType } from "@/types/shipment.types";

const statusColors: Record<ShipmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  picked_up: "bg-indigo-100 text-indigo-800",
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
  pending: "Pending",
  confirmed: "Confirmed",
  picked_up: "Picked Up",
  in_warehouse_china: "In Warehouse (China)",
  in_transit: "In Transit",
  customs_clearance: "Customs Clearance",
  in_warehouse_cameroon: "In Warehouse (Cameroon)",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const typeIcons: Record<ShipmentType, React.ReactNode> = {
  air: <Plane className="h-4 w-4" />,
  sea: <Ship className="h-4 w-4" />,
  ground: <Truck className="h-4 w-4" />,
  express: <Plane className="h-4 w-4 text-yellow-600" />,
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadShipments = async () => {
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
    } catch (error) {
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [pagination.page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadShipments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipment?")) return;
    try {
      await shipmentsApi.deleteShipment(id);
      toast.success("Shipment deleted successfully");
      loadShipments();
    } catch (error) {
      toast.error("Failed to delete shipment");
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
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-gray-500">Manage all shipments and packages</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
            </DialogHeader>
            <CreateShipmentForm
              onSuccess={() => {
                setIsCreateOpen(false);
                loadShipments();
                toast.success("Shipment created successfully");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tracking number, sender, or receiver..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
            Shipments ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No shipments found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
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
                          <span className="capitalize">{shipment.type}</span>
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(shipment.id)}
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
                  Page {pagination.page} of {pagination.totalPages}
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
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Shipment Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <ShipmentDetails shipment={selectedShipment} />
          )}
        </DialogContent>
      </Dialog>
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
    } catch (error) {
      toast.error("Failed to create shipment");
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
          <Label>Shipment Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as ShipmentType }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="air">Air Freight</SelectItem>
              <SelectItem value="sea">Sea Freight</SelectItem>
              <SelectItem value="ground">Ground</SelectItem>
              <SelectItem value="express">Express</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Package Type</Label>
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
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="envelope">Envelope</SelectItem>
              <SelectItem value="pallet">Pallet</SelectItem>
              <SelectItem value="container">Container</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sender Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Sender Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.sender.name}
              onChange={(e) => updateSender("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
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
            <Label>City</Label>
            <Input
              value={formData.sender.city}
              onChange={(e) => updateSender("city", e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Address</Label>
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
        <h3 className="font-semibold text-lg">Receiver Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.receiver.name}
              onChange={(e) => updateReceiver("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
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
            <Label>City</Label>
            <Input
              value={formData.receiver.city}
              onChange={(e) => updateReceiver("city", e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Address</Label>
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
        <h3 className="font-semibold text-lg">Package Details</h3>
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
            <Label>Category</Label>
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
            <Label>Weight (kg)</Label>
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
            <Label>Declared Value (XAF)</Label>
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
            <span className="text-sm">Insurance Required</span>
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
            <span className="text-sm">Signature Required</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Shipment"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Tracking Number</p>
          <p className="text-xl font-mono font-bold">{shipment.trackingNumber}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[shipment.status]}`}
        >
          {statusLabels[shipment.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Sender</h4>
          <div className="text-sm space-y-1">
            <p className="font-medium">{shipment.sender.name}</p>
            <p>{shipment.sender.phone}</p>
            <p>{shipment.sender.address}</p>
            <p>
              {shipment.sender.city}, {shipment.sender.country}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Receiver</h4>
          <div className="text-sm space-y-1">
            <p className="font-medium">{shipment.receiver.name}</p>
            <p>{shipment.receiver.phone}</p>
            <p>{shipment.receiver.address}</p>
            <p>
              {shipment.receiver.city}, {shipment.receiver.country}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Package Details</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="capitalize">{shipment.type}</p>
          </div>
          <div>
            <p className="text-gray-500">Weight</p>
            <p>{shipment.totalWeight} kg</p>
          </div>
          <div>
            <p className="text-gray-500">Declared Value</p>
            <p>{formatCurrency(shipment.declaredValue || 0)}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Cost Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Shipping Cost</span>
            <span>{formatCurrency(shipment.shippingCost)}</span>
          </div>
          {shipment.insuranceCost && (
            <div className="flex justify-between">
              <span>Insurance</span>
              <span>{formatCurrency(shipment.insuranceCost)}</span>
            </div>
          )}
          {shipment.customsDuty && (
            <div className="flex justify-between">
              <span>Customs Duty</span>
              <span>{formatCurrency(shipment.customsDuty)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(shipment.totalCost)}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Items</h4>
        <div className="space-y-2">
          {shipment.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
              <span>{item.description}</span>
              <span>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
