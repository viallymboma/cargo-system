"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  FileText,
  CreditCard,
  Calculator,
  Download,
  Plus,
  Search,
  Eye,
  Trash2,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { billingApi, shipmentsApi } from "@/lib/api";
import type { Invoice, Payment, TariffRule } from "@/lib/api/billing";
import { toast } from "sonner";
import { Shipment } from "@/types";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tariffs, setTariffs] = useState<TariffRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data for dropdowns
  const [shipments, setShipments] = useState<Shipment[]>([]);

  // Dialog states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [tariffDialogOpen, setTariffDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [currentTariff, setCurrentTariff] = useState<TariffRule | null>(null);

  // Shipment picker states for invoice generation
  const [shipmentSearch, setShipmentSearch] = useState("");
  const [generatingForShipmentId, setGeneratingForShipmentId] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    amount: 0,
    method: "CASH",
    transactionId: "",
    reference: "",
    notes: ""
  });

  const [tariffForm, setTariffForm] = useState({
    origin: "",
    destination: "",
    baseRate: 0,
    ratePerKg: 0,
    ratePerVolume: 0,
    minCharge: 0,
    currency: "XAF",
    description: "",
    isActive: true
  });

  useEffect(() => {
    loadBillingData();
    loadDropdownData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all billing data
      const [invoiceData, paymentData, tariffData] = await Promise.all([
        billingApi.getInvoices(),
        billingApi.getPayments(),
        billingApi.getTariffRules(),
      ]);

      setInvoices(invoiceData);
      setPayments(paymentData);
      setTariffs(tariffData);
    } catch (err) {
      console.error("Error loading billing data:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données de facturation");
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const shipmentResult = await shipmentsApi.getShipments();
      setShipments(shipmentResult.data);
    } catch (err) {
      console.error("Error loading dropdown data:", err);
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

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    sent: "Envoyé",
    paid: "Payé",
    overdue: "En retard",
    cancelled: "Annulé",
  };

  // Invoice operations
  const handleCreateInvoice = () => {
    setCurrentInvoice(null);
    setShipmentSearch("");
    setInvoiceDialogOpen(true);
  };

  const handleGenerateInvoiceForShipment = async (shipment: Shipment) => {
    setGeneratingForShipmentId(shipment.id);
    try {
      await billingApi.generateInvoiceForShipment(shipment);
      toast.success("Facture générée avec succès");
      setInvoiceDialogOpen(false);
      loadBillingData();
    } catch (err) {
      console.error("Error generating invoice:", err);
      toast.error("Échec de la génération de la facture");
    } finally {
      setGeneratingForShipmentId(null);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    if (!shipmentSearch) return true;
    const q = shipmentSearch.toLowerCase();
    return (
      s.trackingNumber.toLowerCase().includes(q) ||
      s.sender.name.toLowerCase().includes(q) ||
      s.receiver.name.toLowerCase().includes(q)
    );
  });

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      try {
        await billingApi.deleteInvoice(id);
        toast.success("Facture supprimée avec succès");
        loadBillingData();
      } catch (err) {
        console.error("Error deleting invoice:", err);
        toast.error("Erreur lors de la suppression de la facture");
      }
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setInvoiceDialogOpen(true);
  };

  // Payment CRUD operations
  const handleCreatePayment = () => {
    setPaymentForm({
      invoiceId: "",
      amount: 0,
      method: "CASH",
      transactionId: "",
      reference: "",
      notes: ""
    });
    setCurrentPayment(null);
    setPaymentDialogOpen(true);
  };

  const handleSavePayment = async () => {
    try {
      if (currentPayment) {
        // For now, we'll just reload data since payments can't be updated via API
        toast.info("Les paiements ne peuvent pas être modifiés. Veuillez créer un nouveau paiement ou remboursement.");
      } else {
        // Create new payment
        await billingApi.addPayment({
          invoiceId: paymentForm.invoiceId,
          amount: paymentForm.amount,
          method: paymentForm.method as any,
          transactionId: paymentForm.transactionId,
          reference: paymentForm.reference,
          notes: paymentForm.notes
        });
        toast.success("Paiement enregistré avec succès");
      }
      setPaymentDialogOpen(false);
      loadBillingData();
    } catch (err) {
      console.error("Error saving payment:", err);
      toast.error("Erreur lors de l'enregistrement du paiement");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      try {
        await billingApi.deletePayment(id);
        toast.success("Paiement supprimé avec succès");
        loadBillingData();
      } catch (err) {
        console.error("Error deleting payment:", err);
        toast.error("Erreur lors de la suppression du paiement");
      }
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setPaymentDialogOpen(true);
  };

  // Tariff CRUD operations
  const handleCreateTariff = () => {
    setTariffForm({
      origin: "",
      destination: "",
      baseRate: 0,
      ratePerKg: 0,
      ratePerVolume: 0,
      minCharge: 0,
      currency: "XAF",
      description: "",
      isActive: true
    });
    setCurrentTariff(null);
    setTariffDialogOpen(true);
  };

  const handleSaveTariff = async () => {
    try {
      if (currentTariff) {
        await billingApi.updateTariffRule(currentTariff.id, {
          origin: tariffForm.origin,
          destination: tariffForm.destination,
          baseRate: tariffForm.baseRate,
          ratePerKg: tariffForm.ratePerKg,
          ratePerVolume: tariffForm.ratePerVolume,
          minCharge: tariffForm.minCharge,
          currency: tariffForm.currency,
          description: tariffForm.description || undefined,
          isActive: tariffForm.isActive
        });
        toast.success("Tarif mis à jour avec succès");
      } else {
        await billingApi.createTariffRule({
          origin: tariffForm.origin,
          destination: tariffForm.destination,
          baseRate: tariffForm.baseRate,
          ratePerKg: tariffForm.ratePerKg,
          ratePerVolume: tariffForm.ratePerVolume,
          minCharge: tariffForm.minCharge,
          currency: tariffForm.currency,
          description: tariffForm.description || undefined,
        });
        toast.success("Tarif créé avec succès");
      }
      setTariffDialogOpen(false);
      loadBillingData();
    } catch (err) {
      console.error("Error saving tariff:", err);
      toast.error("Erreur lors de l'enregistrement du tarif");
    }
  };

  const handleDeleteTariff = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) {
      try {
        await billingApi.deleteTariffRule(id);
        toast.success("Tarif supprimé avec succès");
        loadBillingData();
      } catch (err) {
        console.error("Error deleting tariff:", err);
        toast.error("Erreur lors de la suppression du tarif");
      }
    }
  };

  const handleViewTariff = (tariff: TariffRule) => {
    setCurrentTariff(tariff);
    setTariffDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation</h1>
          <p className="text-gray-500">Gestion des factures, paiements et tarifs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total factures
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{invoices.length}</div>
            <p className="text-xs text-gray-500">+12% ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paiements reçus
            </CardTitle>
            <CreditCard className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.length}</div>
            <p className="text-xs text-gray-500">sur {payments.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenu total
            </CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
              )}
            </div>
            <p className="text-xs text-gray-500">+8.2% ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tarifs actifs
            </CardTitle>
            <Calculator className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tariffs.filter(t => t.isActive).length}</div>
            <p className="text-xs text-gray-500">sur {tariffs.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different billing sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="tariffs">Tarifs</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Liste des factures</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher..." className="pl-8 w-64" />
              </div>
              <Button onClick={handleCreateInvoice}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <Card className="p-4">
              <p className="text-red-500 text-center">Erreur: {error}</p>
              <Button onClick={loadBillingData} className="mt-4 mx-auto">Réessayer</Button>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">N° Facture</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Date émission</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Date échéance</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                          <td className="py-3 px-4">{invoice.clientId}</td>
                          <td className="py-3 px-4">{formatCurrency(invoice.totalAmount)}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[invoice.status]}>
                              {statusLabels[invoice.status]}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{formatDate(invoice.createdAt)}</td>
                          <td className="py-3 px-4">{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Historique des paiements</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher..." className="pl-8 w-64" />
              </div>
              <Button onClick={handleCreatePayment}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau paiement
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <Card className="p-4">
              <p className="text-red-500 text-center">Erreur: {error}</p>
              <Button onClick={loadBillingData} className="mt-4 mx-auto">Réessayer</Button>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">ID Paiement</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Facture</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Méthode</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{payment.id}</td>
                          <td className="py-3 px-4">{payment.invoiceId}</td>
                          <td className="py-3 px-4">{formatCurrency(payment.amount)}</td>
                          <td className="py-3 px-4 capitalize">{payment.method.replace('_', ' ')}</td>
                          <td className="py-3 px-4">{formatDate(payment.createdAt)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewPayment(payment)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tariffs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Règles tarifaires</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher..." className="pl-8 w-64" />
              </div>
              <Button onClick={handleCreateTariff}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau tarif
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <Card className="p-4">
              <p className="text-red-500 text-center">Erreur: {error}</p>
              <Button onClick={loadBillingData} className="mt-4 mx-auto">Réessayer</Button>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Origine</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Destination</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Tarif de base</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Par kg</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tariffs.map((tariff) => (
                        <tr key={tariff.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{tariff.description || "-"}</td>
                          <td className="py-3 px-4">{tariff.origin}</td>
                          <td className="py-3 px-4">{tariff.destination}</td>
                          <td className="py-3 px-4">{formatCurrency(parseFloat(tariff.baseRate.toString()))}</td>
                          <td className="py-3 px-4">{formatCurrency(parseFloat(tariff.ratePerKg.toString()))}</td>
                          <td className="py-3 px-4">
                            <Badge className={tariff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {tariff.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewTariff(tariff)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTariff(tariff.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {currentInvoice ? `Facture ${currentInvoice.invoiceNumber}` : "Générer une facture"}
            </DialogTitle>
          </DialogHeader>

          {currentInvoice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">N° Facture</p>
                  <p className="font-medium">{currentInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Statut</p>
                  <Badge className={statusColors[currentInvoice.status]}>
                    {statusLabels[currentInvoice.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500">Montant</p>
                  <p className="font-medium">{formatCurrency(currentInvoice.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Taxes</p>
                  <p className="font-medium">{formatCurrency(currentInvoice.taxes || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-bold text-lg">{formatCurrency(currentInvoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date d{"'"}émission</p>
                  <p className="font-medium">{formatDate(currentInvoice.createdAt)}</p>
                </div>
                {currentInvoice.dueDate && (
                  <div>
                    <p className="text-gray-500">Date d{"'"}échéance</p>
                    <p className="font-medium">{formatDate(currentInvoice.dueDate)}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-hidden">
              <p className="text-sm text-gray-500">
                Sélectionnez une expédition pour générer automatiquement sa facture.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro de suivi, expéditeur ou destinataire..."
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="overflow-y-auto max-h-[400px] border rounded-md">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-500 text-sm">N° Suivi</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500 text-sm">Expéditeur</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500 text-sm">Destinataire</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500 text-sm">Route</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500 text-sm">Poids</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500 text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Aucune expédition trouvée
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono text-sm">{shipment.trackingNumber}</td>
                          <td className="py-2 px-3 text-sm">{shipment.sender.name}</td>
                          <td className="py-2 px-3 text-sm">{shipment.receiver.name}</td>
                          <td className="py-2 px-3 text-sm text-gray-500">
                            {shipment.sender.country} → {shipment.receiver.country}
                          </td>
                          <td className="py-2 px-3 text-sm">{shipment.totalWeight} kg</td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleGenerateInvoiceForShipment(shipment)}
                              disabled={generatingForShipmentId === shipment.id}
                            >
                              {generatingForShipmentId === shipment.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Génération...
                                </>
                              ) : (
                                <>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Générer
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentPayment ? "Détails du paiement" : "Ajouter un nouveau paiement"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentInvoiceId">ID Facture</Label>
              <Input
                id="paymentInvoiceId"
                value={paymentForm.invoiceId}
                onChange={(e) => setPaymentForm({...paymentForm, invoiceId: e.target.value})}
                placeholder="ID de la facture"
              />
            </div>

            <div>
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                placeholder="Montant du paiement"
              />
            </div>

            <div>
              <Label htmlFor="method">Méthode de paiement</Label>
              <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({...paymentForm, method: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="credit_card">Carte de crédit</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transactionId">ID Transaction</Label>
              <Input
                id="transactionId"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                placeholder="ID de la transaction"
              />
            </div>

            <div>
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                placeholder="Référence interne"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="Notes additionnelles"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePayment}>
              {currentPayment ? "Fermer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tariff Dialog */}
      <Dialog open={tariffDialogOpen} onOpenChange={setTariffDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentTariff ? "Modifier le tarif" : "Créer un nouveau tarif"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origine</Label>
              <Input
                id="origin"
                value={tariffForm.origin}
                onChange={(e) => setTariffForm({...tariffForm, origin: e.target.value})}
                placeholder="Pays d'origine"
              />
            </div>

            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={tariffForm.destination}
                onChange={(e) => setTariffForm({...tariffForm, destination: e.target.value})}
                placeholder="Pays de destination"
              />
            </div>

            <div>
              <Label htmlFor="baseRate">Tarif de base</Label>
              <Input
                id="baseRate"
                type="number"
                value={tariffForm.baseRate}
                onChange={(e) => setTariffForm({...tariffForm, baseRate: Number(e.target.value)})}
                placeholder="Tarif fixe de base"
              />
            </div>

            <div>
              <Label htmlFor="ratePerKg">Tarif par kg</Label>
              <Input
                id="ratePerKg"
                type="number"
                value={tariffForm.ratePerKg}
                onChange={(e) => setTariffForm({...tariffForm, ratePerKg: Number(e.target.value)})}
                placeholder="Tarif par kilogramme"
              />
            </div>

            <div>
              <Label htmlFor="ratePerVolume">Tarif par m³</Label>
              <Input
                id="ratePerVolume"
                type="number"
                value={tariffForm.ratePerVolume}
                onChange={(e) => setTariffForm({...tariffForm, ratePerVolume: Number(e.target.value)})}
                placeholder="Tarif par mètre cube"
              />
            </div>

            <div>
              <Label htmlFor="minCharge">Charge minimale</Label>
              <Input
                id="minCharge"
                type="number"
                value={tariffForm.minCharge}
                onChange={(e) => setTariffForm({...tariffForm, minCharge: Number(e.target.value)})}
                placeholder="Montant minimum facturé"
              />
            </div>

            <div>
              <Label htmlFor="currency">Devise</Label>
              <Input
                id="currency"
                value={tariffForm.currency}
                onChange={(e) => setTariffForm({...tariffForm, currency: e.target.value})}
                placeholder="Ex: XAF"
              />
            </div>

            <div>
              <Label htmlFor="isActive">Statut</Label>
              <Select
                value={tariffForm.isActive ? "true" : "false"}
                onValueChange={(value) => setTariffForm({...tariffForm, isActive: value === "true"})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Actif</SelectItem>
                  <SelectItem value="false">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={tariffForm.description}
                onChange={(e) => setTariffForm({...tariffForm, description: e.target.value})}
                placeholder="Description du tarif (optionnel)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTariffDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTariff}>
              {currentTariff ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}