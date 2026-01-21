"use client";

export default function BillingPage() {

  return <div>Billing Page</div>;
}

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { 
//   DollarSign, 
//   FileText, 
//   CreditCard, 
//   Calculator, 
//   TrendingUp, 
//   Calendar,
//   Download,
//   Plus,
//   Search
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { billingApi } from "@/lib/api";

// export default function BillingPage() {
//   const [activeTab, setActiveTab] = useState("invoices");
//   const [invoices, setInvoices] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [tariffs, setTariffs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadBillingData();
//   }, []);

//   const loadBillingData = async () => {
//     setLoading(true);
//     try {
//       // Load all billing data
//       const [invoiceData, paymentData, tariffData] = await Promise.all([
//         billingApi.getInvoices(),
//         billingApi.getPayments(),
//         billingApi.getTariffRules(),
//       ]);
      
//       setInvoices(invoiceData);
//       setPayments(paymentData);
//       setTariffs(tariffData);
//     } catch (error) {
//       console.error("Error loading billing data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("fr-CM", {
//       style: "currency",
//       currency: "XAF",
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatDate = (date: string) => {
//     return new Date(date).toLocaleDateString("fr-FR", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const statusColors: Record<string, string> = {
//     draft: "bg-gray-100 text-gray-800",
//     sent: "bg-blue-100 text-blue-800",
//     paid: "bg-green-100 text-green-800",
//     overdue: "bg-red-100 text-red-800",
//     cancelled: "bg-red-100 text-red-800",
//   };

//   const statusLabels: Record<string, string> = {
//     draft: "Brouillon",
//     sent: "Envoyé",
//     paid: "Payé",
//     overdue: "En retard",
//     cancelled: "Annulé",
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Facturation</h1>
//           <p className="text-gray-500">Gestion des factures, paiements et tarifs</p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline">
//             <Download className="mr-2 h-4 w-4" />
//             Exporter
//           </Button>
//           <Button>
//             <Plus className="mr-2 h-4 w-4" />
//             Nouveau
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">
//               Total factures
//             </CardTitle>
//             <FileText className="h-5 w-5 text-blue-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{invoices.length}</div>
//             <p className="text-xs text-gray-500">+12% ce mois-ci</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">
//               Paiements reçus
//             </CardTitle>
//             <CreditCard className="h-5 w-5 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{payments.filter(p => p.status === 'completed').length}</div>
//             <p className="text-xs text-gray-500">sur {payments.length} total</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">
//               Revenu total
//             </CardTitle>
//             <DollarSign className="h-5 w-5 text-yellow-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">
//               {formatCurrency(
//                 invoices.reduce((sum, invoice) => sum + (invoice.status === 'paid' ? invoice.totalAmount : 0), 0)
//               )}
//             </div>
//             <p className="text-xs text-gray-500">+8.2% ce mois-ci</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">
//               Tarifs actifs
//             </CardTitle>
//             <Calculator className="h-5 w-5 text-purple-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{tariffs.filter(t => t.isActive).length}</div>
//             <p className="text-xs text-gray-500">sur {tariffs.length} total</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Tabs for different billing sections */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="invoices">Factures</TabsTrigger>
//           <TabsTrigger value="payments">Paiements</TabsTrigger>
//           <TabsTrigger value="tariffs">Tarifs</TabsTrigger>
//         </TabsList>

//         <TabsContent value="invoices" className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-semibold">Liste des factures</h2>
//             <div className="flex gap-2">
//               <div className="relative">
//                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input placeholder="Rechercher..." className="pl-8 w-64" />
//               </div>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Nouvelle facture
//               </Button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//             </div>
//           ) : (
//             <Card>
//               <CardContent className="p-0">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">N° Facture</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Date émission</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Date échéance</th>
//                         <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {invoices.map((invoice) => (
//                         <tr key={invoice.id} className="hover:bg-gray-50">
//                           <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
//                           <td className="py-3 px-4">{invoice.clientId}</td>
//                           <td className="py-3 px-4">{formatCurrency(invoice.totalAmount)}</td>
//                           <td className="py-3 px-4">
//                             <Badge className={statusColors[invoice.status]}>
//                               {statusLabels[invoice.status]}
//                             </Badge>
//                           </td>
//                           <td className="py-3 px-4">{formatDate(invoice.issueDate)}</td>
//                           <td className="py-3 px-4">{formatDate(invoice.dueDate)}</td>
//                           <td className="py-3 px-4 text-right">
//                             <Button variant="ghost" size="sm">Voir</Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="payments" className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-semibold">Historique des paiements</h2>
//             <div className="flex gap-2">
//               <div className="relative">
//                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input placeholder="Rechercher..." className="pl-8 w-64" />
//               </div>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Nouveau paiement
//               </Button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//             </div>
//           ) : (
//             <Card>
//               <CardContent className="p-0">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">ID Paiement</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Facture</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Méthode</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
//                         <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {payments.map((payment) => (
//                         <tr key={payment.id} className="hover:bg-gray-50">
//                           <td className="py-3 px-4 font-medium">{payment.id}</td>
//                           <td className="py-3 px-4">{payment.invoiceId}</td>
//                           <td className="py-3 px-4">{formatCurrency(payment.amount)}</td>
//                           <td className="py-3 px-4 capitalize">{payment.method.replace('_', ' ')}</td>
//                           <td className="py-3 px-4">
//                             <Badge className={
//                               payment.status === 'completed' ? 'bg-green-100 text-green-800' :
//                               payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                               'bg-red-100 text-red-800'
//                             }>
//                               {payment.status === 'completed' ? 'Complété' :
//                                payment.status === 'pending' ? 'En attente' : 'Échoué'}
//                             </Badge>
//                           </td>
//                           <td className="py-3 px-4">{formatDate(payment.processedAt)}</td>
//                           <td className="py-3 px-4 text-right">
//                             <Button variant="ghost" size="sm">Voir</Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="tariffs" className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-semibold">Règles tarifaires</h2>
//             <div className="flex gap-2">
//               <div className="relative">
//                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input placeholder="Rechercher..." className="pl-8 w-64" />
//               </div>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Nouveau tarif
//               </Button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//             </div>
//           ) : (
//             <Card>
//               <CardContent className="p-0">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Origine</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Destination</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Tarif de base</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Par kg</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Devise</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
//                         <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {tariffs.map((tariff) => (
//                         <tr key={tariff.id} className="hover:bg-gray-50">
//                           <td className="py-3 px-4 font-medium">{tariff.origin}</td>
//                           <td className="py-3 px-4">{tariff.destination}</td>
//                           <td className="py-3 px-4">{formatCurrency(tariff.baseRate)}</td>
//                           <td className="py-3 px-4">{formatCurrency(tariff.ratePerKg)}</td>
//                           <td className="py-3 px-4">{tariff.currency}</td>
//                           <td className="py-3 px-4">
//                             <Badge className={tariff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
//                               {tariff.isActive ? 'Actif' : 'Inactif'}
//                             </Badge>
//                           </td>
//                           <td className="py-3 px-4 text-right">
//                             <Button variant="ghost" size="sm">Modifier</Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }