"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User as UserType, Permission } from "@/types/auth.types";
import {
  User as UserIcon,
  Lock,
  Bell,
  Globe,
  Building,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings user={user} onUpdate={setUser} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferenceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSettings({
  user,
  onUpdate,
}: {
  user: UserType | null;
  onUpdate: (user: UserType) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updated = await authApi.updateProfile(formData);
      onUpdate(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role.replace(/_/g, " ")}
                </span>
                {user.agency && (
                  <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                    <Building className="h-3 w-3" />
                    {user.agency.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
              <p className="text-sm text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+237 6XX XXX XXX"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Your current access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission: Permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {permission.replace(/_/g, " ").toLowerCase()}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(passwords.current, passwords.new);
      toast.success("Password changed successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, current: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
                }
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-gray-500">
                  Use an authenticator app for 2FA
                </p>
              </div>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-500">
                  Browser - {typeof navigator !== "undefined" ? navigator.userAgent.split(" ")[0] : "Unknown"}
                </p>
              </div>
              <span className="text-green-600 text-sm">Active Now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailShipmentUpdates: true,
    emailPaymentReceipts: true,
    emailPromotions: false,
    smsShipmentUpdates: true,
    smsDelivery: true,
    whatsappUpdates: true,
    pushNotifications: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification settings updated");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Shipment Updates</p>
              <p className="text-sm text-gray-500">
                Get notified when your shipment status changes
              </p>
            </div>
            <Switch
              checked={settings.emailShipmentUpdates}
              onCheckedChange={() => handleToggle("emailShipmentUpdates")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payment Receipts</p>
              <p className="text-sm text-gray-500">
                Receive email receipts for payments
              </p>
            </div>
            <Switch
              checked={settings.emailPaymentReceipts}
              onCheckedChange={() => handleToggle("emailPaymentReceipts")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Promotional Emails</p>
              <p className="text-sm text-gray-500">
                Receive news and special offers
              </p>
            </div>
            <Switch
              checked={settings.emailPromotions}
              onCheckedChange={() => handleToggle("emailPromotions")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
          <CardDescription>Configure SMS alerts for your shipments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Shipment Updates</p>
              <p className="text-sm text-gray-500">
                SMS alerts for major status changes
              </p>
            </div>
            <Switch
              checked={settings.smsShipmentUpdates}
              onCheckedChange={() => handleToggle("smsShipmentUpdates")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delivery Notifications</p>
              <p className="text-sm text-gray-500">
                Get notified when package is delivered
              </p>
            </div>
            <Switch
              checked={settings.smsDelivery}
              onCheckedChange={() => handleToggle("smsDelivery")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Notifications</CardTitle>
          <CardDescription>Receive updates via WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">WhatsApp Updates</p>
              <p className="text-sm text-gray-500">
                Receive real-time updates on WhatsApp
              </p>
            </div>
            <Switch
              checked={settings.whatsappUpdates}
              onCheckedChange={() => handleToggle("whatsappUpdates")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Browser push notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Push Notifications</p>
              <p className="text-sm text-gray-500">
                Get instant updates in your browser
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceSettings() {
  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "XAF",
    timezone: "Africa/Douala",
    dateFormat: "DD/MM/YYYY",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Set your preferred language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, language: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="fr">Francais</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              value={preferences.currency}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, currency: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="XAF">XAF - CFA Franc</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, timezone: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Africa/Douala">Africa/Douala (WAT)</option>
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="Europe/Paris">Europe/Paris (CET)</option>
              <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date Format</Label>
            <select
              value={preferences.dateFormat}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, dateFormat: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <Button onClick={() => toast.success("Preferences saved")}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
