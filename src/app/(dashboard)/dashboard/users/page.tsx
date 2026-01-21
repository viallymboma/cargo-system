"use client";

import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Building,
  Mail,
  Phone,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { type User, type Role, type Agency } from "@/types/auth.types";
import { Switch } from "@/components/ui/switch";

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  manager: "Manager",
  agent: "Agent",
  warehouse_staff: "Personnel Entrepôt",
  customer: "Client",
};

const roleColors: Record<Role, string> = {
  super_admin: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  agent: "bg-green-100 text-green-800",
  warehouse_staff: "bg-orange-100 text-orange-800",
  customer: "bg-gray-100 text-gray-800",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, agenciesData] = await Promise.all([
        usersApi.getUsers(),
        usersApi.getAgencies(),
      ]);
      setUsers(usersData);
      setAgencies(agenciesData);
    } catch (error) {
      toast.error("Échec du chargement des données");
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    let filtered = [...users];

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(term) ||
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.deleteUser(userToDelete.id);
      toast.success("Utilisateur supprimé avec succès");
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
      loadData();
    } catch {
      toast.error("Échec de la suppression de l'utilisateur");
    }
  };

  const handleToggleClick = (user: User) => {
    setUserToToggle(user);
    setIsToggleConfirmOpen(true);
  };

  const confirmToggleActive = async () => {
    if (!userToToggle) return;
    try {
      if (userToToggle.isActive) {
        await usersApi.deactivateUser(userToToggle.id);
        toast.success("Utilisateur désactivé");
      } else {
        await usersApi.activateUser(userToToggle.id);
        toast.success("Utilisateur activé");
      }
      setIsToggleConfirmOpen(false);
      setUserToToggle(null);
      loadData();
    } catch {
      toast.error("Échec de la mise à jour du statut");
    }
  };

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      admins: users.filter((u) => u.role === "admin" || u.role === "super_admin").length,
      agents: users.filter((u) => u.role === "agent").length,
    };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-gray-500">Gérer les utilisateurs, rôles et permissions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
            </DialogHeader>
            <CreateUserForm
              agencies={agencies}
              onSuccess={() => {
                setIsCreateOpen(false);
                loadData();
                toast.success("Utilisateur créé avec succès");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administrateurs</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Agents</p>
                <p className="text-2xl font-bold">{stats.agents}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les Rôles</SelectItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredUsers().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.firstName?.[0] || "U"}
                            {user.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.agency ? (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {user.agency.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleToggleClick(user)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditOpen(true);
                          }}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {getFilteredUsers().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete User Confirm Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">{"Confirmer la suppression"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm">
                {`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete?.firstName} ${userToDelete?.lastName} ? Cette action est irréversible.`}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                {"Annuler"}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
              >
                {"Supprimer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle Activation Confirm Dialog */}
      <Dialog open={isToggleConfirmOpen} onOpenChange={setIsToggleConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{"Confirmer le changement de statut"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <p className="text-sm">
                {userToToggle?.isActive
                  ? `Voulez-vous vraiment désactiver l'utilisateur ${userToToggle?.firstName} ${userToToggle?.lastName} ?`
                  : `Voulez-vous vraiment activer l'utilisateur ${userToToggle?.firstName} ${userToToggle?.lastName} ?`}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsToggleConfirmOpen(false)}>
                {"Annuler"}
              </Button>
              <Button
                variant={userToToggle?.isActive ? "destructive" : "default"}
                onClick={confirmToggleActive}
              >
                {userToToggle?.isActive ? "Désactiver" : "Activer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{"Modifier l'Utilisateur"}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              agencies={agencies}
              onSuccess={() => {
                setIsEditOpen(false);
                loadData();
                toast.success("Utilisateur mis à jour avec succès");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateUserForm({
  agencies,
  onSuccess,
}: {
  agencies: Agency[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "agent" as Role,
    agencyId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usersApi.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        role: formData.role,
        agencyId: formData.agencyId || undefined,
      });
      onSuccess();
    } catch {
      toast.error("Échec de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prénom</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Mot de passe</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Téléphone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Rôle</Label>
        <Select
          value={formData.role}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v as Role }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Agence</Label>
        <Select
          value={formData.agencyId || "none"}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, agencyId: v === "none" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une agence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune</SelectItem>
            {agencies.map((agency) => (
              <SelectItem key={agency.id} value={agency.id}>
                {agency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création...
          </>
        ) : (
          "Créer l'Utilisateur"
        )}
      </Button>
    </form>
  );
}

function EditUserForm({
  user,
  agencies,
  onSuccess,
}: {
  user: User;
  agencies: Agency[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    role: user.role,
    agencyId: user.agencyId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usersApi.updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        role: formData.role,
        agencyId: formData.agencyId || null,
      });
      onSuccess();
    } catch {
      toast.error("Échec de la mise à jour de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prénom</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Téléphone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Rôle</Label>
        <Select
          value={formData.role}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v as Role }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Agence</Label>
        <Select
          value={formData.agencyId || "none"}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, agencyId: v === "none" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une agence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune</SelectItem>
            {agencies.map((agency) => (
              <SelectItem key={agency.id} value={agency.id}>
                {agency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer les Modifications"
        )}
      </Button>
    </form>
  );
}
