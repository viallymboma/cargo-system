"use client";

import { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Mail, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  RefreshCw
} from "lucide-react";
import { notificationsApi } from "@/lib/api";

// Define types for notification data
type NotificationType = 'info' | 'warning' | 'success' | 'error';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  relatedEntity?: string; // shipment ID, invoice ID, etc.
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // For now, we'll use mock data since the backend might not have a notifications API yet
      // In a real implementation, we would call: const data = await notificationsApi.getNotifications();
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Expédition livrée",
          message: "Votre colis ST-202401-01 a été livré avec succès.",
          type: "success",
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          read: false,
          relatedEntity: "ST-202401-01"
        },
        {
          id: "2",
          title: "Paiement reçu",
          message: "Le paiement pour la facture INV-2024-001 a été enregistré.",
          type: "success",
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          read: true,
          relatedEntity: "INV-2024-001"
        },
        {
          id: "3",
          title: "Colis en retard",
          message: "Le colis ST-202401-02 est en retard par rapport à l'estimation.",
          type: "warning",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: false,
          relatedEntity: "ST-202401-02"
        },
        {
          id: "4",
          title: "Nouvelle facture",
          message: "Une nouvelle facture INV-2024-002 a été générée.",
          type: "info",
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          read: true,
          relatedEntity: "INV-2024-002"
        },
        {
          id: "5",
          title: "Erreur de traitement",
          message: "Un problème est survenu lors du traitement de votre commande.",
          type: "error",
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          read: false,
          relatedEntity: "ORD-2024-003"
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // In a real implementation: await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? {...n, read: true} : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real implementation: await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({...n, read: true})));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // In a real implementation: await notificationsApi.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `${diffHours} h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} j`;
    }
  };

  const typeIcons: Record<NotificationType, JSX.Element> = {
    info: <Mail className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
  };

  const typeColors: Record<NotificationType, string> = {
    info: "border-blue-200 bg-blue-50",
    warning: "border-yellow-200 bg-yellow-50",
    success: "border-green-200 bg-green-50",
    error: "border-red-200 bg-red-50",
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : activeTab === 'read'
      ? notifications.filter(n => n.read)
      : notifications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-500">Alertes et mises à jour importantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
          <Button variant="outline" onClick={loadNotifications}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total
            </CardTitle>
            <Bell className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.length}</div>
            <p className="text-xs text-gray-500">Toutes les notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Non lues
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.filter(n => !n.read).length}</div>
            <p className="text-xs text-gray-500">Nécessitent votre attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ce mois
            </CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {notifications.filter(n => {
                const date = new Date(n.timestamp);
                const now = new Date();
                const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
                return diffMonths <= 1;
              }).length}
            </div>
            <p className="text-xs text-gray-500">Notifications récentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Toutes ({notifications.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'unread'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('unread')}
        >
          Non lues ({notifications.filter(n => !n.read).length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'read'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('read')}
        >
          Lues ({notifications.filter(n => n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">Aucune notification</h3>
              <p className="mt-1 text-gray-500">
                Vous n'avez aucune notification {activeTab === 'unread' ? 'non lue' : ''}.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${!notification.read ? 'ring-2 ring-blue-500' : ''} ${typeColors[notification.type]} transition-all duration-200`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{formatDate(notification.timestamp)}</span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    {notification.relatedEntity && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.relatedEntity}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                        title="Marquer comme lu"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteNotification(notification.id)}
                      title="Supprimer"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}