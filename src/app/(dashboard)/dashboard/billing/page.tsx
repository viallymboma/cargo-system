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
  Receipt,
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Download,
  Eye,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  Banknote,
  Building,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import type { Invoice, Payment, PaymentMethod, InvoiceStatus, Tariff } from "@/types/billing.types";

const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-blue-100 text-blue-800",
  partially_paid: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  pending: "En attente",
  sent: "Envoyée",
  partially_paid: "Partiellement payée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const paymentMethodIcons: Record<PaymentMethod, React.ReactNode> = {
  mobile_money: <Smartphone className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
  bank_transfer: <Building className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  other: <DollarSign className="h-4 w-4" />,
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money",
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  card: "Carte bancaire",
  other: "Autre",
};

const shipmentTypeLabels: Record<string, string> = {
  air: "Fret Aérien",
  sea: "Fret Maritime",
  express: "Express",
  ground: "Terrestre",
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isTariffOpen, setIsTariffOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const store = useMockDataStore.getState();
      setInvoices(store.invoices);
      setPayments(store.payments);
      setTariffs(store.getTariffs());
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilteredInvoices = () => {
    let filtered = [...invoices];

    if (statusFilter !== "all") {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(term) ||
          i.customerName.toLowerCase().includes(term)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getTotalRevenue = () => {
    return invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.totalAmount, 0);
  };

  const getPendingAmount = () => {
    return invoices
      .filter((i) => i.status === "pending" || i.status === "partially_paid")
      .reduce((sum, i) => sum + i.amountDue, 0);
  };

  const getOverdueAmount = () => {
    return invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + i.amountDue, 0);
  };

  const handleDeleteTariff = (id: string) => {
    const success = useMockDataStore.getState().deleteTariff(id);
    if (success) {
      toast.success("Tarif supprimé avec succès");
      loadData();
    } else {
      toast.error("Erreur lors de la suppression du tarif");
    }
  };

  const handleToggleTariffStatus = (tariff: Tariff) => {
    const updated = useMockDataStore.getState().updateTariff(tariff.id, {
      isActive: !tariff.isActive,
    });
    if (updated) {
      toast.success(updated.isActive ? "Tarif activé" : "Tarif désactivé");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation & Paiements</h1>
          <p className="text-gray-500">Gérez les factures et traitez les paiements</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer une facture
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</p>
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
                <p className="text-sm text-gray-500">Paiements en attente</p>
                <p className="text-2xl font-bold">{formatCurrency(getPendingAmount())}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En retard</p>
                <p className="text-2xl font-bold">{formatCurrency(getOverdueAmount())}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total factures</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="tariffs">Tarifs</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher des factures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="partially_paid">Partiellement payée</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Payé</TableHead>
                      <TableHead>Reste dû</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredInvoices().map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.customerName}</div>
                            <div className="text-sm text-gray-500">
                              {invoice.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(invoice.amountPaid)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(invoice.amountDue)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}
                          >
                            {statusLabels[invoice.status]}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.status !== "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setIsPaymentOpen(true);
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Payer
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {getFilteredInvoices().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Aucune facture trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaction</TableHead>
                    <TableHead>Facture</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const invoice = invoices.find((i) => i.id === payment.invoiceId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId || payment.id}
                        </TableCell>
                        <TableCell>{invoice?.invoiceNumber || "N/A"}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {paymentMethodIcons[payment.method]}
                            <span>
                              {paymentMethodLabels[payment.method]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status === "completed" ? "Complété" : payment.status === "pending" ? "En attente" : "Échoué"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Aucun paiement enregistré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tariffs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tarifs d'expédition</CardTitle>
              <Button onClick={() => setIsTariffOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau tarif
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prix/kg</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariffs.map((tariff) => (
                    <TableRow key={tariff.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tariff.name}</div>
                          {tariff.description && (
                            <div className="text-sm text-gray-500">{tariff.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tariff.originCountry} → {tariff.destinationCountry}
                      </TableCell>
                      <TableCell>
                        {shipmentTypeLabels[tariff.shipmentType] || tariff.shipmentType}
                      </TableCell>
                      <TableCell>{formatCurrency(tariff.pricePerKg)}/kg</TableCell>
                      <TableCell>{formatCurrency(tariff.minimumCharge)}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleTariffStatus(tariff)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            tariff.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {tariff.isActive ? "Actif" : "Inactif"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTariff(tariff.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tariffs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Aucun tarif configuré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Invoice Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la facture</DialogTitle>
          </DialogHeader>
          {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} />}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traiter le paiement</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <PaymentForm
              invoice={selectedInvoice}
              onSuccess={() => {
                setIsPaymentOpen(false);
                loadData();
                toast.success("Paiement effectué avec succès");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Tariff Dialog */}
      <Dialog open={isTariffOpen} onOpenChange={setIsTariffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau tarif</DialogTitle>
          </DialogHeader>
          <TariffForm
            onSuccess={() => {
              setIsTariffOpen(false);
              loadData();
              toast.success("Tarif créé avec succès");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusLabels: Record<InvoiceStatus, string> = {
    draft: "Brouillon",
    pending: "En attente",
    sent: "Envoyée",
    partially_paid: "Partiellement payée",
    paid: "Payée",
    overdue: "En retard",
    cancelled: "Annulée",
    refunded: "Remboursée",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Numéro de facture</p>
          <p className="text-xl font-mono font-bold">{invoice.invoiceNumber}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status]}`}
        >
          {statusLabels[invoice.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Client</p>
          <p className="font-medium">{invoice.customerName}</p>
          <p className="text-sm text-gray-500">{invoice.customerPhone}</p>
          <p className="text-sm text-gray-500">{invoice.customerAddress}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Date d'émission</p>
          <p>{new Date(invoice.issueDate).toLocaleDateString("fr-FR")}</p>
          <p className="text-sm text-gray-500 mt-2">Date d'échéance</p>
          <p>{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Lignes de facturation</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        {invoice.taxAmount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>TVA ({invoice.taxRate}%)</span>
            <span>{formatCurrency(invoice.taxAmount)}</span>
          </div>
        )}
        {invoice.discount && invoice.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Remise</span>
            <span>-{formatCurrency(invoice.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>{formatCurrency(invoice.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Montant payé</span>
          <span>{formatCurrency(invoice.amountPaid)}</span>
        </div>
        <div className="flex justify-between text-red-600 font-medium">
          <span>Reste à payer</span>
          <span>{formatCurrency(invoice.amountDue)}</span>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({
  invoice,
  onSuccess,
}: {
  invoice: Invoice;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: invoice.amountDue,
    method: "mobile_money" as PaymentMethod,
    mobileMoneyProvider: "mtn" as "mtn" | "orange",
    mobileMoneyNumber: "",
    reference: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      useMockDataStore.getState().createPayment({
        invoiceId: invoice.id,
        amount: formData.amount,
        method: formData.method,
        mobileMoneyProvider:
          formData.method === "mobile_money" ? formData.mobileMoneyProvider : undefined,
        mobileMoneyNumber:
          formData.method === "mobile_money" ? formData.mobileMoneyNumber : undefined,
        reference: formData.reference,
      });

      onSuccess();
    } catch (error) {
      toast.error("Échec du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between">
          <span className="text-gray-500">Facture</span>
          <span className="font-mono">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-gray-500">Montant dû</span>
          <span className="font-bold">{formatCurrency(invoice.amountDue)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Montant du paiement</Label>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
          }
          max={invoice.amountDue}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Mode de paiement</Label>
        <Select
          value={formData.method}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, method: v as PaymentMethod }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile_money">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Money
              </div>
            </SelectItem>
            <SelectItem value="cash">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Espèces
              </div>
            </SelectItem>
            <SelectItem value="bank_transfer">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Virement bancaire
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.method === "mobile_money" && (
        <>
          <div className="space-y-2">
            <Label>Opérateur</Label>
            <Select
              value={formData.mobileMoneyProvider}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  mobileMoneyProvider: v as "mtn" | "orange",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="orange">Orange Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Numéro de téléphone</Label>
            <Input
              value={formData.mobileMoneyNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobileMoneyNumber: e.target.value }))
              }
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Référence (Optionnel)</Label>
        <Input
          value={formData.reference}
          onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
          placeholder="Référence de transaction"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirmer le paiement
          </>
        )}
      </Button>
    </form>
  );
}

function TariffForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerKg: 0,
    minimumCharge: 0,
    volumetricDivisor: 5000,
    shipmentType: "air",
    originCountry: "",
    destinationCountry: "Cameroun",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      useMockDataStore.getState().createTariff({
        name: formData.name,
        description: formData.description || undefined,
        pricePerKg: formData.pricePerKg,
        minimumCharge: formData.minimumCharge,
        volumetricDivisor: formData.volumetricDivisor,
        shipmentType: formData.shipmentType,
        originCountry: formData.originCountry,
        destinationCountry: formData.destinationCountry,
      });

      onSuccess();
    } catch (error) {
      toast.error("Erreur lors de la création du tarif");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nom du tarif *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Fret Aérien Chine-Cameroun"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description du tarif"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pays d'origine *</Label>
          <Input
            value={formData.originCountry}
            onChange={(e) => setFormData((prev) => ({ ...prev, originCountry: e.target.value }))}
            placeholder="Ex: Chine"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Pays de destination *</Label>
          <Input
            value={formData.destinationCountry}
            onChange={(e) => setFormData((prev) => ({ ...prev, destinationCountry: e.target.value }))}
            placeholder="Ex: Cameroun"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Type d'expédition *</Label>
        <Select
          value={formData.shipmentType}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, shipmentType: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="air">Fret Aérien</SelectItem>
            <SelectItem value="sea">Fret Maritime</SelectItem>
            <SelectItem value="express">Express</SelectItem>
            <SelectItem value="ground">Terrestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prix par kg (XAF) *</Label>
          <Input
            type="number"
            value={formData.pricePerKg}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pricePerKg: parseFloat(e.target.value) || 0 }))
            }
            placeholder="15000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Frais minimum (XAF) *</Label>
          <Input
            type="number"
            value={formData.minimumCharge}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, minimumCharge: parseFloat(e.target.value) || 0 }))
            }
            placeholder="50000"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Diviseur volumétrique</Label>
        <Input
          type="number"
          value={formData.volumetricDivisor}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, volumetricDivisor: parseInt(e.target.value) || 5000 }))
          }
          placeholder="5000"
        />
        <p className="text-xs text-gray-500">
          Utilisé pour calculer le poids volumétrique (L x l x H / diviseur)
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création en cours...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Créer le tarif
          </>
        )}
      </Button>
    </form>
  );
}
