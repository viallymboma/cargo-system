import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Permission, Role } from "@/types/auth.types";
import { RolePermissions } from "@/types/auth.types";

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Permission helpers
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;

        // Check user's direct permissions first
        if (user.permissions?.includes(permission)) return true;

        // Check role-based permissions
        const rolePermissions = RolePermissions[user.role] || [];
        return rolePermissions.includes(permission);
      },

      hasAnyPermission: (permissions) => {
        const { hasPermission } = get();
        return permissions.some((p) => hasPermission(p));
      },

      hasAllPermissions: (permissions) => {
        const { hasPermission } = get();
        return permissions.every((p) => hasPermission(p));
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
