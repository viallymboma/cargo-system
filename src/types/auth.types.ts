// User permissions
export enum Permission {
  // Shipment permissions
  VIEW_SHIPMENTS = "view_shipments",
  CREATE_SHIPMENT = "create_shipment",
  UPDATE_SHIPMENT = "update_shipment",
  DELETE_SHIPMENT = "delete_shipment",

  // Tracking permissions
  VIEW_TRACKING = "view_tracking",
  UPDATE_TRACKING = "update_tracking",

  // Billing permissions
  VIEW_BILLING = "view_billing",
  CREATE_INVOICE = "create_invoice",
  UPDATE_INVOICE = "update_invoice",
  PROCESS_PAYMENT = "process_payment",

  // User management permissions
  VIEW_USERS = "view_users",
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",

  // Agency management permissions
  VIEW_AGENCIES = "view_agencies",
  CREATE_AGENCY = "create_agency",
  UPDATE_AGENCY = "update_agency",
  DELETE_AGENCY = "delete_agency",

  // Warehouse permissions
  VIEW_WAREHOUSE = "view_warehouse",
  SCAN_PACKAGES = "scan_packages",
  UPDATE_WAREHOUSE = "update_warehouse",

  // Reports permissions
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",
}

// User roles
export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  AGENT = "agent",
  WAREHOUSE_STAFF = "warehouse_staff",
  CUSTOMER = "customer",
}

// Role permissions mapping
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.VIEW_SHIPMENTS,
    Permission.CREATE_SHIPMENT,
    Permission.UPDATE_SHIPMENT,
    Permission.VIEW_TRACKING,
    Permission.UPDATE_TRACKING,
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICE,
    Permission.UPDATE_INVOICE,
    Permission.PROCESS_PAYMENT,
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.VIEW_AGENCIES,
    Permission.VIEW_WAREHOUSE,
    Permission.SCAN_PACKAGES,
    Permission.UPDATE_WAREHOUSE,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [Role.MANAGER]: [
    Permission.VIEW_SHIPMENTS,
    Permission.CREATE_SHIPMENT,
    Permission.UPDATE_SHIPMENT,
    Permission.VIEW_TRACKING,
    Permission.UPDATE_TRACKING,
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICE,
    Permission.VIEW_USERS,
    Permission.VIEW_WAREHOUSE,
    Permission.VIEW_REPORTS,
  ],
  [Role.AGENT]: [
    Permission.VIEW_SHIPMENTS,
    Permission.CREATE_SHIPMENT,
    Permission.VIEW_TRACKING,
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICE,
  ],
  [Role.WAREHOUSE_STAFF]: [
    Permission.VIEW_SHIPMENTS,
    Permission.VIEW_TRACKING,
    Permission.UPDATE_TRACKING,
    Permission.VIEW_WAREHOUSE,
    Permission.SCAN_PACKAGES,
    Permission.UPDATE_WAREHOUSE,
  ],
  [Role.CUSTOMER]: [
    Permission.VIEW_SHIPMENTS,
    Permission.VIEW_TRACKING,
    Permission.VIEW_BILLING,
  ],
};

// Agency type
export interface Agency {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  permissions: Permission[];
  agencyId?: string;
  agency?: Agency;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
