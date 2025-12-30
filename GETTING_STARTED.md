# 🚀 COMPLETE SETUP GUIDE - ShipTrack Frontend

## 📋 What You Have Received

A **production-ready Next.js 15 frontend** with:

### ✅ Core Files
- `package.json` - All dependencies (React 19, Next.js 15, TailwindCSS, etc.)
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Custom theme with status colors
- `.env.example` - Template for environment variables

### ✅ Type Definitions (in `/types` folder)
- `auth.types.ts` - User, Role, Permission, Agency types
- `shipment.types.ts` - Shipment, Sender, Receiver types
- `tracking.types.ts` - Tracking events and timeline
- `billing.types.ts` - Invoice, Payment, Tariff types

### ✅ API Integration (in `/lib/api` folder)
- `client.ts` - Axios client with JWT token refresh
- `auth.ts` - Login, register, logout, user management
- `shipments.ts` - CRUD operations for shipments

### ✅ State Management (in `/lib/stores` folder)
- `auth-store.ts` - Global authentication state with RBAC

### ✅ Components (in `/components` folder)
- `layout/dashboard-layout.tsx` - Responsive sidebar navigation
- `tracking/tracking-timeline.tsx` - Animated tracking timeline

### ✅ Utilities (in `/lib/utils` folder)
- `cn.ts` - Tailwind class merger
- `format.ts` - Currency, date, number formatting for Cameroon

### ✅ Documentation
- `README.md` - Project overview
- `INSTALLATION.md` - Detailed setup
- `ROADMAP.md` - 13-phase development plan
- `PROJECT_STRUCTURE.md` - Architecture explanation

---

## 🎯 STEP-BY-STEP SETUP

### Step 1: Create Your Next.js Project (5 minutes)

```bash
# Create new Next.js 15 project
npx create-next-app@latest shipment-tracker

# When prompted, choose:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: No
# ✓ App Router: Yes
# ✓ Import alias: Yes (@/*)

cd shipment-tracker
```

### Step 2: Copy All Files (5 minutes)

Copy all the files I've provided into your project:

```
shipment-tracker/
├── types/              ← Copy all .ts files
├── lib/                ← Copy all folders and files
├── components/         ← Copy all folders and files
├── package.json        ← Replace existing
├── tsconfig.json       ← Replace existing
├── tailwind.config.ts  ← Replace existing
└── .env.example        ← Copy this file
```

### Step 3: Install Dependencies (5 minutes)

```bash
# Install all dependencies
npm install

# This will install:
# - React 19 & Next.js 15
# - Zustand (state management)
# - React Query (data fetching)
# - Axios (HTTP client)
# - Framer Motion (animations)
# - date-fns (date formatting)
# - Zod (validation)
# - And more...
```

### Step 4: Setup Environment (2 minutes)

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your backend URLs
# Minimum required:
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Step 5: Initialize shadcn/ui (10 minutes)

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# When prompted:
# Style: Default
# Base color: Slate  
# CSS variables: Yes

# Add essential components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add switch
npx shadcn@latest add checkbox
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
```

### Step 6: Create App Structure (20 minutes)

Create these files:

**1. Create `app/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**2. Create `app/providers.tsx`:**
```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**3. Create `app/layout.tsx`:**
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShipTrack - Logistics Management Platform",
  description: "Track and manage shipments from China to Cameroon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**4. Create `app/page.tsx` (temporary landing page):**
```typescript
import Link from "next/link";
import { Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-4">
            <Package className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          ShipTrack
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Logistics Management Platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-100"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**5. Create `middleware.ts` (in root directory):**
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/register");
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 7: Test the Setup (2 minutes)

```bash
# Run development server
npm run dev
```

Open http://localhost:3000 - you should see the landing page!

---

## 🎨 YOUR FIRST PAGES TO BUILD

### Priority 1: Login Page

Create `app/(auth)/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Package } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-600 p-3">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Sign in to ShipTrack</h2>
          <p className="mt-2 text-gray-600">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

Create `app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### Priority 2: Dashboard Page

Create `app/(dashboard)/page.tsx`:

```typescript
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to ShipTrack</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-600">
              Total Shipments
            </h3>
            <p className="mt-2 text-3xl font-bold">1,234</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-600">
              In Transit
            </h3>
            <p className="mt-2 text-3xl font-bold">45</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-600">
              Delivered
            </h3>
            <p className="mt-2 text-3xl font-bold">1,189</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-600">
              Revenue
            </h3>
            <p className="mt-2 text-3xl font-bold">45M XAF</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

Create `app/(dashboard)/layout.tsx`:
```typescript
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

---

## 🧪 TESTING YOUR SETUP

1. **Start the dev server**: `npm run dev`
2. **Visit**: http://localhost:3000
3. **Test login**: Go to http://localhost:3000/login
4. **Check dashboard**: After login, should redirect to /dashboard

---

## 📁 FINAL PROJECT STRUCTURE

```
shipment-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── ui/              (from shadcn)
│   ├── layout/
│   │   └── dashboard-layout.tsx
│   └── tracking/
│       └── tracking-timeline.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── shipments.ts
│   ├── stores/
│   │   └── auth-store.ts
│   └── utils/
│       ├── cn.ts
│       └── format.ts
├── types/
│   ├── auth.types.ts
│   ├── shipment.types.ts
│   ├── tracking.types.ts
│   └── billing.types.ts
├── middleware.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env.local
```

---

## 🎯 WHAT TO BUILD NEXT

Following this order:

1. ✅ **Login Page** (you just built this!)
2. ✅ **Dashboard Page** (you just built this!)
3. 🔄 **Shipments List** - `app/(dashboard)/shipments/page.tsx`
4. 🔄 **Create Shipment** - `app/(dashboard)/shipments/new/page.tsx`
5. 🔄 **Tracking Page** - `app/(dashboard)/tracking/page.tsx`
6. 🔄 **Warehouse Scanner** - `app/(dashboard)/warehouse/page.tsx`
7. 🔄 **Billing/Invoices** - `app/(dashboard)/billing/page.tsx`

---

## 💡 QUICK TIPS

### Using the API
```typescript
import { shipmentsApi } from "@/lib/api/shipments";

// In your component
const shipments = await shipmentsApi.getShipments({ page: 1 });
```

### Using Auth Store
```typescript
import { useAuthStore } from "@/lib/stores/auth-store";

const { user, hasPermission } = useAuthStore();

if (hasPermission(Permission.CREATE_SHIPMENT)) {
  // Show create button
}
```

### Formatting
```typescript
import { formatCurrency, formatDate } from "@/lib/utils/format";

formatCurrency(50000); // "50 000 XAF"
formatDate(new Date()); // "30 December 2025"
```

---

## 🆘 TROUBLESHOOTING

### "Cannot find module '@/...'"
- Check `tsconfig.json` has the paths configured
- Restart VS Code

### "Hydration error"
- Make sure client components have `"use client"` directive
- Check for mismatched server/client rendering

### "API connection failed"
- Verify backend is running
- Check `.env.local` has correct URLs
- Look for CORS errors in browser console

---

## ✅ CHECKLIST

Before proceeding:
- [ ] Project created with `create-next-app`
- [ ] All files copied to correct locations
- [ ] `npm install` completed
- [ ] shadcn/ui initialized
- [ ] `.env.local` created and configured
- [ ] `npm run dev` works
- [ ] Can see landing page at localhost:3000
- [ ] Login page created
- [ ] Dashboard page created

---

**You're now ready to build! Start with the login page and test it with your backend.** 🚀

For more details, check:
- `README.md` - Full project overview
- `INSTALLATION.md` - Detailed instructions
- `ROADMAP.md` - Complete feature list
- `PROJECT_STRUCTURE.md` - Architecture details
