# Phase 0.5: Authentication & User Management — Clerk + Convex

**Status:** 0% Complete (0/10 Tasks)
**Owner:** Team Lead / Security Lead
**Time estimate:** ~1-2 hours
**Depends on:** Phase 0 (Scaffold complete)

This phase integrates **Clerk** for identity management and **Convex** for secure, authenticated data access. This is critical to ensure that patient data is protected and that agent actions are attributed to a specific user.

---

## 0.5.1 Install Clerk + Convex Integration

```bash
pnpm add @clerk/nextjs convex
```

## 0.5.2 Configure Clerk in Convex

1.  In the [Convex Dashboard](https://dashboard.convex.dev), go to **Settings** > **Auth**.
2.  Add a new **OIDC Provider**.
3.  For **Issuer URL**, use your Clerk Frontend API URL (from the Clerk dashboard).
4.  Copy the generated **Client ID** and **Issuer URL** to your `.env.local`.

## 0.5.3 Update Environment Variables

**File: `.env.local`** (and update `.env.example`)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk + Convex
NEXT_PUBLIC_CLERK_DOMAIN=your-clerk-domain.clerk.accounts.dev
```

## 0.5.4 Proxy Configuration (formerly Middleware)

Starting with Next.js 16, `middleware.ts` is deprecated in favor of `proxy.ts` (running on Node.js runtime).

**File: `proxy.ts`**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

const middleware = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Next.js 16 convention: export default function proxy
export default function proxy(req: any, event: any) {
  return middleware(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## 0.5.5 Authenticated Convex Provider

Refactor the Convex provider to use Clerk's authentication state.

**File: `components/providers/convex-provider.tsx`**

```tsx
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

## 0.5.6 Update Root Layout

Ensure the body is wrapped in `ThemeProvider` and then `ConvexClientProvider`.

**File: `app/layout.tsx`**

```tsx
// ... imports
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.variable}>
        <ThemeProvider ...>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 0.5.7 User Presence in Schema

Update the Convex schema to track authorized users if needed.

**File: `convex/schema.ts`** (append)

```typescript
// ... existing tables
users: defineTable({
  tokenIdentifier: v.string(), // Clerk's unique ID
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  role: v.string(), // 'clinician', 'admin', 'researcher'
}).index("by_token", ["tokenIdentifier"]),
```

## 0.5.8 Auth UI Components

Add standard Clerk components (UserButton, SignIn, SignUp) to the Navbar.

---

## PR Checklist — Phase 0.5

- [ ] `@clerk/nextjs` installed and configured
- [ ] Middleware protecting all `/dashboard` and `/api` routes
- [ ] `ConvexClientProvider` correctly using `ConvexProviderWithClerk`
- [ ] Clerk environment variables added to `.env.local` and `.env.example`
- [ ] Login/Sign-up flow verified locally
- [ ] Authenticated user context available in Convex functions (`ctx.auth.getUserIdentity()`)
- [ ] Navbar displays `UserButton` when authenticated
- [ ] Public landing page (`/`) accessible without login
- [ ] Redirect to `/dashboard` after successful login
- [ ] No hydration errors related to Clerk/Next.js 15
