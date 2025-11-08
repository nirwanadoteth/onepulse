---
description: Comprehensive guidance for GitHub Copilot to generate code consistent with OnePulse's standards, architecture, technology versions, and actual codebase patterns
applyTo: '**'
---

# OnePulse Copilot Instructions

This document provides GitHub Copilot with comprehensive guidance to generate code consistent with OnePulse's project standards, architecture, and technology stack. All guidance is strictly based on actual code patterns observed in the codebase.

---

## Project Overview

**OnePulse** is a Farcaster Mini App built with Next.js that enables users to:
- Say "GM" daily on Base, Celo, and Optimism networks
- Track streaks and statistics
- Claim DEGEN token rewards
- Integrate with the Farcaster ecosystem

The application uses OnchainKit for wallet interactions, Wagmi for blockchain operations, and Tailwind CSS for styling.

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.0.1 | App Router, SSR, API routes |
| React | ^19.2.0 | UI framework |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4.1.16 | Styling |
| Viem | ^2.38.6 | Low-level blockchain interactions |
| Wagmi | ^2.19.2 | React hooks for Ethereum |
| OnchainKit | latest | Wallet, transactions, identity |
| Farcaster MiniApp SDK | ^0.2.1 | Mini App runtime integration |

### Key Dependencies

- **@coinbase/onchainkit** - Wallet connections, transactions, identity components
- **@farcaster/miniapp-sdk** - Mini App frame initialization and actions
- **@farcaster/miniapp-node** - Node.js runtime for Mini App
- **@radix-ui/** - Accessible UI component primitives
- **motion** - Animation library
- **sonner** - Toast notifications
- **spacetimedb** - Real-time database for stats
- **canvas-confetti** - Celebratory animations

### Development Tools

- **ESLint 9** - Code linting (Next.js config)
- **Prettier 3.6.2** - Code formatting
- **Bun** - JavaScript runtime and package manager
- **PostCSS 8.5.6** - CSS processing

---

## Project Architecture

### Directory Structure

```
app/                          # Next.js App Router
├── layout.tsx               # Root layout with metadata
├── page.tsx                 # Home page (main Mini App)
├── root-provider.tsx        # Root context providers
├── globals.css              # Global styles
├── onchainkit.css          # OnchainKit theme overrides
├── api/                     # API routes
│   ├── auth/               # Authentication endpoints
│   ├── claims/             # DEGEN claims endpoints
│   ├── gm/                 # GM operations endpoints
│   ├── notify/             # Notification endpoints
│   ├── og/                 # Open Graph endpoints
│   └── webhook/            # Webhook endpoints
└── robots.ts               # Robots metadata

components/                   # React components
├── providers/               # Context providers
│   ├── frame-provider.tsx
│   ├── wagmi-provider.tsx
│   ├── spacetimedb-provider.tsx
│   └── color-scheme-sync.tsx
├── ui/                      # Shadcn/Radix UI components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   └── ...
├── gm-base/                # GM feature (core logic)
│   ├── congrats-dialog.tsx
│   ├── use-congrats-logic.ts
│   ├── use-per-chain-status.ts
│   └── chain-config.ts
├── gm-chain-card/          # GM per-chain UI
│   ├── gm-chain-card.tsx
│   ├── action-button.tsx
│   ├── use-transaction-status.ts
│   └── ...
├── home-header.tsx
├── home-tabs.tsx
└── ...

hooks/                       # Custom React hooks
├── use-gm-stats.ts         # GM statistics
├── use-connection.ts       # Wallet connection
├── use-frame-initialization.ts
├── use-onboarding.ts
└── ...

lib/                        # Utilities & helpers
├── utils.ts               # General utilities (cn, detectCoinbaseSmartWallet)
├── constants.ts           # Contract addresses, constants
├── ens-utils.ts          # ENS/Basename resolution
├── notifications.ts      # Toast notifications
├── abi/                  # Smart contract ABIs
└── module_bindings/      # SpacetimeDB generated bindings

stores/                     # External state management
├── gm-store.ts           # GM stats store (useSyncExternalStore)
└── connection-store.ts   # Connection state

types/                      # TypeScript type definitions
├── css.d.ts              # CSS module declarations
└── onchainkit-css.d.ts   # OnchainKit CSS declarations

public/                     # Static assets
├── icon.png              # Mini App icon
├── splash.png            # Mini App splash screen
├── logo.png              # Logo
└── ...

server/                     # Rust/SpacetimeDB server
└── src/

contracts/                  # Solidity smart contracts
├── DailyGM.sol
└── DailyRewards.sol
```

### Data Flow

```
Farcaster Frame
    ↓
Mini App SDK (initialize, ready)
    ↓
React App (layout.tsx → page.tsx)
    ↓
RootProvider (Wagmi, OnchainKit, Theme, SpacetimeDB)
    ↓
Home Page Components
    ├→ GM Feature (gm-base, gm-chain-card)
    ├→ Rewards Display
    └→ User Stats (from SpacetimeDB store)
    ↓
Smart Contracts (DailyGM, DailyRewards)
```

---

## Naming Conventions

### Files & Directories

- **Components**: `PascalCase` - `HomeHeader.tsx`, `GmChainCard.tsx`, `OnboardingModal.tsx`
- **Hooks**: `camelCase` prefixed with `use-` - `useGmStats.ts`, `useConnection.ts`, `useFrameInitialization.ts`
- **Utilities/Helpers**: `camelCase` - `utils.ts`, `constants.ts`, `ens-utils.ts`
- **Stores**: `camelCase` with `-store.ts` suffix - `gm-store.ts`, `connection-store.ts`
- **Types/Interfaces**: `PascalCase` - `GmStats`, `HomeContentProps`, `Chain`
- **Directories**: `kebab-case` - `gm-base`, `gm-chain-card`, `ui`, `providers`
- **Constants**: `UPPER_SNAKE_CASE` - `ZERO`, `EMPTY_ROWS`, `ONBOARDING_KEY`, `DAILY_GM_ADDRESSES`

### Variables & Functions

- **React Components** (functions): `PascalCase` - `HomeContent`, `StatsDisplay`, `GmChainCard`
- **React Hooks** (functions): `camelCase` prefixed with `use` - `useGmStats`, `useConnection`
- **Regular functions**: `camelCase` - `computeGMState`, `getChainBtnClasses`, `normalizeAddress`
- **Variables**: `camelCase` - `isConnected`, `gmDisabled`, `targetSec`
- **Boolean variables**: Prefix with `is`, `has`, `show`, `should` - `isFrameReady`, `hasGmToday`, `showDisconnect`, `shouldEnableSave`
- **Event handlers**: Prefix with `handle` or `on` - `handleMiniAppAdded`, `onTabChange`, `onStoreChange`

### Types & Props

- **Props interfaces**: Suffix with `Props` - `HomeContentProps`, `HomeBackgroundProps`, `StatsDisplayProps`
- **Type exports**: Export from index files using barrel exports
- **Type-only imports**: Use `import type { ... }` syntax

**Example:**
```tsx
// Component file
interface GmChainCardProps {
  chainId: number
  address?: string
  onStatusChange?: (status: GmStatus) => void
}

export function GmChainCard({ chainId, address, onStatusChange }: GmChainCardProps) {
  // ...
}
```

---

## Code Style & Formatting

### Prettier Configuration

All files are formatted with Prettier using the following rules (defined in `package.json`):

```
- Line endings: LF
- Semicolons: false
- Single quotes: false (use double quotes)
- Tab width: 2 spaces
- Trailing commas: ES5
```

### Import Order

Imports are automatically sorted by `@ianvs/prettier-plugin-sort-imports` in this priority order:

1. React and Next.js imports
2. Third-party modules
3. Workspace aliases (`@workspace/*`)
4. Type definitions
5. Config files
6. Lib utilities
7. Hooks
8. UI components
9. Feature components
10. App routes
11. Styles
12. Relative imports

**Example:**
```tsx
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useMiniKit } from "@coinbase/onchainkit/minikit"

import { useFrameInitialization } from "@/hooks/use-frame-initialization"
import { useGmStats } from "@/hooks/use-gm-stats"
import { Button } from "@/components/ui/button"
import { GmChainCard } from "@/components/gm-chain-card"
import { cn } from "@/lib/utils"
```

### TypeScript Configuration

- **Target**: `esnext`
- **Module**: `esnext`
- **Module Resolution**: `bundler`
- **Strict Mode**: Enabled (required)
- **JSX**: `react-jsx` (no import React needed)
- **Path Aliases**: `@/*` maps to root directory

### ESLint Rules

Uses `eslint-config-next` with core web vitals and TypeScript support. Key rules:
- No unused variables
- No console logs in production code (development allowed with comments)
- Proper React hook dependencies
- No explicit `any` types without justification

---

## Next.js Patterns

### App Router Structure

- **All new code uses App Router** (not Pages Router)
- **Default to Server Components** unless interactivity, hooks, or browser APIs are needed
- **Use Client Components** (`'use client'` directive) only when necessary

### Metadata & SEO

```tsx
// app/layout.tsx - Generate metadata for SEO and OG tags
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.ogTitle || minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.ogDescription,
    openGraph: {
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.heroImageUrl],
      url: minikitConfig.miniapp.homeUrl,
      siteName: minikitConfig.miniapp.name,
    },
    twitter: {
      card: "summary_large_image",
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
    },
  }
}
```

### Layout Structure

```tsx
// Root layout wraps everything with providers
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}

// Page-specific layouts can add additional context
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  )
}
```

### Dynamic Imports

Use `dynamic` for client-only components (with proper loading states):

```tsx
const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
)
```

**Important:** Never use `next/dynamic` with `{ ssr: false }` in Server Components. Instead, move client-only logic to a dedicated Client Component and import it directly.

### Environment Variables

- **Public variables**: Prefix with `NEXT_PUBLIC_` - accessible in browser
- **Private variables**: No prefix - only available on server
- **Load from**: `.env.local` file (never commit)
- **Reference in code**: Via `process.env.VAR_NAME`

**Pattern for fallback configuration:**
```tsx
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
```

---

## React Component Patterns

### Functional Components with Props

Always use typed props interfaces:

```tsx
interface UserCardProps {
  name: string
  address: `0x${string}`
  isOnline?: boolean
  onConnect?: () => void
}

export function UserCard({ name, address, isOnline = false, onConnect }: UserCardProps) {
  return (
    <div className="flex items-center gap-2">
      <span>{name}</span>
      {isOnline && <span className="text-green-500">●</span>}
    </div>
  )
}
```

### Server Components

Used for data fetching and non-interactive content:

```tsx
// app/dashboard/page.tsx (Server Component by default)
import { GmStats } from "@/components/gm-stats"

export default async function DashboardPage() {
  const stats = await fetchGmStats() // Safe to call async
  return <GmStats stats={stats} />
}
```

### Client Components

Marked with `'use client'` directive at the top:

```tsx
// components/interactive-card.tsx
'use client'

import { useState } from "react"

export function InteractiveCard() {
  const [count, setCount] = useState(0) // Can use hooks

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Extracted Helper Components

For reducing complexity, extract smaller components:

```tsx
// Extracted for clarity and memoization
const StatsDisplay = React.memo(function StatsDisplay({
  stats,
  isConnected,
}: {
  stats: GmStats
  isConnected: boolean
}) {
  if (!isConnected) return <div>Connect wallet</div>
  return <div>{stats.currentStreak}</div>
})

// In parent component
function GmCard() {
  return <StatsDisplay stats={stats} isConnected={isConnected} />
}
```

### React.memo for Performance

Use `React.memo` for components that receive the same props frequently:

```tsx
const StatColumn = React.memo(function StatColumn({
  value,
  label,
}: {
  value?: number
  label: string
}) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold">{value ?? "-"}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
})
```

### Conditional Rendering

Use ternary for simple conditions, explicit checks for complex logic:

```tsx
// Simple conditions - use ternary
{isConnected ? (
  <UserProfile address={address} />
) : (
  <ConnectButton />
)}

// Complex logic - extract to function
function determineOnboardingSaveHandler(
  isFrameReady: boolean,
  inMiniApp: boolean,
  clientAdded: boolean | undefined,
  handleMiniAppAdded: () => void
) {
  const shouldEnableSave = isFrameReady && inMiniApp && clientAdded !== true
  return shouldEnableSave ? handleMiniAppAdded : undefined
}

const saveHandler = determineOnboardingSaveHandler(isFrameReady, inMiniApp, clientAdded, handleMiniAppAdded)
```

---

## TypeScript Patterns

### Strict Mode Required

All TypeScript code must be written with strict mode enabled. No explicit `any` types without justification.

### Type Definitions

Define types in dedicated files, not inline:

```tsx
// types/gm.ts
export type GmStats = {
  currentStreak: number
  highestStreak: number
  allTimeGmCount: number
  lastGmDay: number
}

export const ZERO: GmStats = {
  currentStreak: 0,
  highestStreak: 0,
  allTimeGmCount: 0,
  lastGmDay: 0,
}

export const EMPTY_ROWS: GmStatsByAddress[] = []
```

### Utility Types

Use utility types for common patterns:

```tsx
// Extract return type from function
type StatusResult = ReturnType<typeof useTransactionStatus>

// Extract props from component
type ButtonProps = React.ComponentProps<"button">

// Readonly records
type ChainExplorerMap = Readonly<Record<number, string>>

// Discriminated unions for complex states
type TxState =
  | { status: "pending"; txHash: string }
  | { status: "success"; receipt: TransactionReceipt }
  | { status: "error"; message: string }
```

### Viem Types

Use Viem types for blockchain values:

```tsx
import { type Address } from "viem"

// Typed address parameter
function getUserStats(address: Address): Promise<GmStats> {
  // ...
}

// Type-safe contract addresses
const DAILY_GM_ADDRESS = "0x..." as const satisfies Address
```

### Zod for Runtime Validation (when needed)

Validate external data at boundaries:

```tsx
import { z } from "zod"

const GmStatsSchema = z.object({
  currentStreak: z.number(),
  highestStreak: z.number(),
  allTimeGmCount: z.number(),
})

type GmStats = z.infer<typeof GmStatsSchema>
```

---

## API Routes & Server-Side Code

### Route Handler Structure

Place API routes in `app/api/` directory:

```tsx
// app/api/gm/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")
    if (!address) {
      return NextResponse.json(
        { error: "Missing address parameter" },
        { status: 400 }
      )
    }

    const stats = await fetchGmStats(address)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching GM stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await reportGm(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error reporting GM:", error)
    return NextResponse.json(
      { error: "Failed to report GM" },
      { status: 500 }
    )
  }
}
```

### HTTP Methods

Export async functions named after HTTP verbs:

```tsx
export async function GET(request: NextRequest) { }
export async function POST(request: NextRequest) { }
export async function PUT(request: NextRequest) { }
export async function DELETE(request: NextRequest) { }
export async function PATCH(request: NextRequest) { }
```

### Error Handling

Always validate and handle errors appropriately:

```tsx
export async function POST(request: NextRequest) {
  // Input validation
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    // Process body
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      )
    }
    // Handle other errors
  }
}
```

### Environment Variables on Server

Private environment variables (no `NEXT_PUBLIC_` prefix) are only available on the server:

```tsx
// app/api/secure-operation/route.ts
export async function POST(request: NextRequest) {
  const privateKey = process.env.PRIVATE_KEY // Only works on server
  const apiSecret = process.env.API_SECRET   // Only works on server
  // ...
}
```

---

## State Management & Hooks

### useSyncExternalStore Pattern

Used for cross-component state that persists beyond React lifecycle:

```tsx
// stores/gm-store.ts
class GmStatsByAddressStore {
  private listeners: Set<() => void> = new Set()
  private cachedSnapshot: GmStatsByAddress[] = []

  subscribe(onStoreChange: () => void) {
    this.listeners.add(onStoreChange)
    return () => {
      this.listeners.delete(onStoreChange)
    }
  }

  getSnapshot() {
    return this.cachedSnapshot
  }

  getServerSnapshot() {
    return this.cachedSnapshot
  }

  private emitChange() {
    this.listeners.forEach((listener) => listener())
  }
}

export const gmStatsByAddressStore = new GmStatsByAddressStore()

// In component
export function useGmStats(address?: string | null) {
  const snapshot = useSyncExternalStore(
    (onChange) => gmStatsByAddressStore.subscribe(onChange),
    () => gmStatsByAddressStore.getSnapshot(),
    () => gmStatsByAddressStore.getServerSnapshot()
  )
  return snapshot
}
```

### Custom Hooks Pattern

Extract logic into hooks for reusability:

```tsx
// hooks/use-gm-stats.ts
export function useGmStats(address?: string | null, chainId?: number) {
  const normalizedAddress = normalizeAddress(address)
  const snapshot = useGmStatsSubscription(address)

  const rowsByAddress = useMemo(
    () => groupRowsByAddress(snapshot),
    [snapshot]
  )

  const stats: GmStats = useMemo(() => {
    if (!normalizedAddress) return ZERO
    return deriveStatsForAddress(rowsByAddress.get(normalizedAddress) ?? EMPTY_ROWS)
  }, [normalizedAddress, rowsByAddress])

  const isReady = gmStatsByAddressStore.isSubscribedForAddress(address)

  return { stats, isReady }
}
```

### Wagmi Hooks

Use Wagmi hooks for blockchain interactions:

```tsx
import { useChainId, useReadContract } from "wagmi"

export function GmChainCard() {
  const chainId = useChainId()

  const { data: lastGmDay, isPending } = useReadContract({
    address: DAILY_GM_ADDRESS,
    abi: dailyGMAbi,
    functionName: "lastGmDay",
    args: [address],
  })

  return (
    <div>
      {isPending ? <Spinner /> : <div>{lastGmDay}</div>}
    </div>
  )
}
```

### OnchainKit Hooks

Use OnchainKit hooks for wallet and identity:

```tsx
import { useMiniKit } from "@coinbase/onchainkit/minikit"

export function Header() {
  const { context } = useMiniKit()
  const { user } = context || {}

  return (
    <div>
      {user?.username && <span>Welcome, {user.username}</span>}
    </div>
  )
}
```

### LocalStorage Patterns

For client-side persistent state:

```tsx
// hooks/use-onboarding.ts
const ONBOARDING_KEY = "onepulse:onboarded"

function subscribeOnboarding(listener: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener)
  }
  onboardingLocalListeners.add(listener)
  return () => {
    onboardingLocalListeners.delete(listener)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener)
    }
  }
}

export function useOnboarding() {
  const showOnboardingModal = useSyncExternalStore(
    subscribeOnboarding,
    () => {
      try {
        if (typeof window === "undefined") return false
        return !window.localStorage.getItem(ONBOARDING_KEY)
      } catch {
        return false
      }
    }
  )

  const dismissOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1")
      onboardingLocalListeners.forEach((l) => l())
    } catch {
      // Handle error silently
    }
  }

  return { showOnboardingModal, dismissOnboarding }
}
```

---

## Styling with Tailwind CSS

### Tailwind CSS v4

The project uses Tailwind CSS v4.1.16 with `@tailwindcss/postcss`:

```tsx
// app/globals.css
@import "tailwindcss";

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

### The `cn()` Utility

Use the `cn()` utility for conditional class merging:

```tsx
import { cn } from "@/lib/utils"

export function Button({ className, variant = "default" }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-black",
        className
      )}
    />
  )
}
```

### CSS-in-JS with class-variance-authority

Use CVA for complex component variants:

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

### Radix UI with Tailwind

Radix UI components are styled with Tailwind classes:

```tsx
// components/ui/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"

export function Dialog(props: DialogProps) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-4 shadow-lg data-[state=open]:animate-in">
        {/* Content */}
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
```

### Motion Library for Animations

Use `motion` library for smooth animations:

```tsx
import { motion } from "motion/react"

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg p-4 bg-card"
    >
      Content
    </motion.div>
  )
}
```

### Responsive Design

Use Tailwind breakpoints for responsive design:

```tsx
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* Items */}
    </div>
  )
}
```

### Dark Mode Support

Next Themes handles dark mode toggling:

```tsx
export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  )
}
```

---

## OnchainKit Integration

### OnchainKitProvider Setup

Wrap the app with OnchainKitProvider in root provider:

```tsx
// app/root-provider.tsx
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID!}
      chain={base}
      config={{
        appearance: {
          name: process.env.NEXT_PUBLIC_PROJECT_NAME,
          logo: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
          mode: "auto",
          theme: "custom",
        },
        wallet: {
          display: "modal",
          preference: "all",
          supportedWallets: {
            rabby: true,
            trust: true,
            frame: true,
          },
        },
      }}
      miniKit={{
        enabled: true,
      }}
    >
      {children}
    </OnchainKitProvider>
  )
}
```

### Using ConnectWallet

```tsx
import { ConnectWallet } from "@coinbase/onchainkit/wallet"

export function Header() {
  return (
    <div className="flex items-center justify-between">
      <h1>App</h1>
      <ConnectWallet />
    </div>
  )
}
```

### Using Identity Components

```tsx
import { Avatar, Name, Badge } from "@coinbase/onchainkit/identity"
import { base } from "wagmi/chains"

export function UserProfile({ address }: { address: Address }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar address={address} chain={base} />
      <Name address={address} chain={base} />
      <Badge address={address} chain={base} />
    </div>
  )
}
```

### Using Transactions

```tsx
import { Transaction, TransactionButton } from "@coinbase/onchainkit/transaction"

export function GmTransaction() {
  return (
    <Transaction
      contracts={[
        {
          address: DAILY_GM_ADDRESS,
          abi: dailyGMAbi,
          functionName: "gm",
          args: [],
        },
      ]}
      onSuccess={() => {
        // Handle success
      }}
    >
      <TransactionButton text="Say GM" />
    </Transaction>
  )
}
```

### Detecting Coinbase Smart Wallet

```tsx
import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet"

export async function detectCoinbaseSmartWallet(
  address: `0x${string}`
): Promise<boolean> {
  const userOperation: RpcUserOperation<"0.6"> = {
    sender: address,
    nonce: "0x0",
    initCode: "0x",
    callData: "0x",
    callGasLimit: "0x0",
    verificationGasLimit: "0x0",
    preVerificationGas: "0x0",
    maxFeePerGas: "0x0",
    maxPriorityFeePerGas: "0x0",
    paymasterAndData: "0x",
    signature: "0x",
  }

  try {
    const res = await isWalletACoinbaseSmartWallet({
      client: publicClient,
      userOp: userOperation,
    })
    return res.isCoinbaseSmartWallet === true
  } catch {
    return false
  }
}
```

---

## Farcaster MiniApp Integration

### Mini App SDK Initialization

Initialize the Mini App SDK in the main page component:

```tsx
// app/page.tsx
'use client'

import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { useFrameInitialization } from "@/hooks/use-frame-initialization"

export default function Page() {
  const { context, isReady } = useMiniKit()
  const isFrameReady = useFrameInitialization()

  if (!isFrameReady) {
    return <SplashScreen />
  }

  return <MainApp context={context} />
}
```

### MiniApp Configuration

Define Mini App metadata in `minikit.config.ts`:

```tsx
// minikit.config.ts
export const minikitConfig = {
  accountAssociation: {
    header: "...",      // Signed domain header
    payload: "...",     // Domain payload
    signature: "...",   // Account association signature
  },
  miniapp: {
    version: "1",       // Must be "1"
    name: "OnePulse",
    subtitle: "Daily GM on Base",
    description: "...",
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "white", // White background
    homeUrl: ROOT_URL,
    heroImageUrl: `${ROOT_URL}/hero.png`,
    ogTitle: "OnePulse",
    ogDescription: "...",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    primaryCategory: "social",
    tags: ["base", "gm", "daily"],
  },
} as const
```

### Frame Metadata

Include frame metadata in Open Graph tags:

```tsx
const frame = {
  version: minikitConfig.miniapp.version,
  imageUrl: minikitConfig.miniapp.heroImageUrl,
  button: {
    title: "GM on Base",
    action: {
      type: "launch_frame",
      name: minikitConfig.miniapp.name,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:miniapp": JSON.stringify(frame),
    },
  }
}
```

### useMiniKit Hook Usage

```tsx
import { useMiniKit } from "@coinbase/onchainkit/minikit"

export function App() {
  const { context, isReady } = useMiniKit()

  if (!isReady) return <Loading />

  const user = context?.user
  const client = context?.client

  return (
    <div>
      {user?.username && <span>Welcome, {user.username}</span>}
    </div>
  )
}
```

### Mini App Ready Signal

Signal when the Mini App is ready to display:

```tsx
import { sdk } from "@farcaster/miniapp-sdk"

export function useFrameInitialization() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready()
        setIsReady(true)
      } catch (error) {
        console.error("Failed to initialize mini app:", error)
      }
    }

    init()
  }, [])

  return isReady
}
```

---

## Common Patterns & Anti-Patterns

### ✅ GOOD PATTERNS

#### 1. Extract Helper Functions for Complex Logic

```tsx
// Extracted helper - easier to test and understand
const computeGMState = (
  address: string | undefined,
  contractAddress: `0x${string}`,
  isConnected: boolean,
  lastGmDayData: unknown,
  isPendingLastGm: boolean
) => {
  if (!address || !contractAddress) {
    return { hasGmToday: false, gmDisabled: !isConnected, targetSec: 0 }
  }

  const lastDay = Number((lastGmDayData as bigint) ?? 0n)
  const nowSec = Math.floor(Date.now() / 1000)
  const currentDay = Math.floor(nowSec / 86400)
  const alreadyGmToday = lastDay >= currentDay

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
    targetSec: (currentDay + 1) * 86400,
  }
}

// In component
const gmState = computeGMState(address, contractAddr, isConnected, lastGmDay, isPending)
```

#### 2. Use Maps for Efficient Lookups

```tsx
// From gm-chain-card.tsx
const chainExplorerMap: Record<number, string> = {
  [base.id]: "https://basescan.org",
  [celo.id]: "https://celoscan.io",
  [optimism.id]: "https://optimistic.etherscan.io",
}

export function getChainExplorer(chainId?: number) {
  if (!chainId) return "https://basescan.org"
  return chainExplorerMap[chainId] ?? "https://basescan.org"
}
```

#### 3. Memoize Computed Values with useMemo

```tsx
const rowsByAddress = useMemo(() => groupRowsByAddress(snapshot), [snapshot])

const rowsForAddress = useMemo(() => {
  if (!normalizedAddress) return EMPTY_ROWS
  return rowsByAddress.get(normalizedAddress) ?? EMPTY_ROWS
}, [normalizedAddress, rowsByAddress])
```

#### 4. Separate Concerns with Multiple Small Components

```tsx
// Instead of one large component, break into logical parts
const StatsDisplay = React.memo(function StatsDisplay({ stats, isConnected }: Props) {
  return <div>{/* stats rendering */}</div>
})

const ActionButtons = React.memo(function ActionButtons({ onClaim, disabled }: Props) {
  return <div>{/* buttons */}</div>
})

function GmCard() {
  return (
    <>
      <StatsDisplay stats={stats} isConnected={isConnected} />
      <ActionButtons onClaim={handleClaim} disabled={isPending} />
    </>
  )
}
```

#### 5. Handle Errors Gracefully

```tsx
export async function detectCoinbaseSmartWallet(address: `0x${string}`): Promise<boolean> {
  try {
    const res = await isWalletACoinbaseSmartWallet({ client: publicClient, userOp: userOperation })
    return res.isCoinbaseSmartWallet === true
  } catch {
    return false // Graceful fallback instead of throwing
  }
}
```

### ❌ ANTI-PATTERNS TO AVOID

#### 1. Inline Complex Logic in Components

```tsx
// ❌ BAD - Too much logic in one place
function GmCard() {
  const lastDay = Number((lastGmDayData as bigint) ?? 0n)
  const nowSec = Math.floor(Date.now() / 1000)
  const currentDay = Math.floor(nowSec / 86400)
  const alreadyGmToday = lastDay >= currentDay
  const nextDayStartSec = (currentDay + 1) * 86400
  // ... more logic
}

// ✅ GOOD - Extract to helper
function GmCard() {
  const gmState = computeGMState(address, contractAddr, isConnected, lastGmDay, isPending)
  // Use gmState
}
```

#### 2. Hardcoded Configuration Values

```tsx
// ❌ BAD
const addresses = {
  base: "0x123...",
  celo: "0x456...",
}

// ✅ GOOD
export const DAILY_GM_ADDRESSES: Record<number, `0x${string}`> = {
  8453: process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_BASE as `0x${string}`,
  42220: process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_CELO as `0x${string}`,
  10: process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_OPTIMISM as `0x${string}`,
}
```

#### 3. Missing Type Definitions

```tsx
// ❌ BAD
function processStats(stats) { // Implicit any
  return { streak: stats.currentStreak }
}

// ✅ GOOD
function processStats(stats: GmStats): ProcessedStats {
  return { streak: stats.currentStreak }
}
```

#### 4. Unhandled Promises

```tsx
// ❌ BAD - Promise rejected silently
window.addEventListener("load", async () => {
  await initializeApp() // No error handling
})

// ✅ GOOD - Handle errors
window.addEventListener("load", async () => {
  try {
    await initializeApp()
  } catch (error) {
    console.error("Failed to initialize:", error)
  }
})
```

#### 5. Using any Type

```tsx
// ❌ BAD
const data: any = response.data

// ✅ GOOD
interface ApiResponse {
  data: GmStats
}
const response: ApiResponse = await fetch(...)
```

#### 6. Unnecessary use of `useEffect` for Initialization

```tsx
// ❌ BAD - useEffect for props that change
function Component({ userId }: Props) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetchUser(userId)
  }, [userId]) // Fetches on every prop change
}

// ✅ GOOD - For side effects only
function Component({ userId }: Props) {
  const { data: user } = useQuery(['user', userId], () => fetchUser(userId))
  return <div>{user?.name}</div>
}
```

---

## Performance Optimization

### Code Splitting with Dynamic Imports

Split large components and load them on-demand:

```tsx
const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
)

export function Page() {
  const showParticles = usePreference("showParticles")
  return showParticles && <Particles />
}
```

### Memoization Strategy

Use `useMemo` for expensive computations and `React.memo` for components:

```tsx
// Memoize expensive computations
const rowsByAddress = useMemo(() => groupRowsByAddress(snapshot), [snapshot])

// Memoize components that receive many props
const StatsDisplay = React.memo(function StatsDisplay(props) {
  return <div>{props.stats}</div>
})
```

### Image Optimization

Use Next.js Image component for automatic optimization:

```tsx
import Image from "next/image"

export function HeroImage() {
  return (
    <Image
      src="/hero.png"
      alt="Hero"
      width={1200}
      height={630}
      priority // For above-the-fold images
    />
  )
}
```

### Bundle Analysis

Monitor bundle size with build analysis. Keep critical path minimal.

---

## Security Practices

### Input Validation

Always validate and sanitize user input:

```tsx
// Validate addresses
const isValidAddress = (addr: string): boolean => {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

// Sanitize URLs for SSRF prevention
const isAllowedUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ["https://trusted-domain.com"].includes(parsed.hostname)
  } catch {
    return false
  }
}
```

### Environment Variables

Never expose secrets in client code:

```tsx
// ✅ GOOD - Only on server
export async function POST(request: NextRequest) {
  const privateKey = process.env.PRIVATE_KEY // Only accessible on server
}

// ❌ BAD - Exposed to client
export const API_KEY = process.env.API_KEY // Don't do this without NEXT_PUBLIC_
```

### Secure Contract Interactions

Validate contract calls and use typed arguments:

```tsx
import { type Address } from "viem"

// Type-safe contract function call
const tx = await publicClient.writeContract({
  account: address as Address,
  address: DAILY_GM_ADDRESS as Address,
  abi: dailyGMAbi,
  functionName: "gm",
  args: [], // Type-checked arguments
})
```

### XSS Prevention

Use `.textContent` instead of `.innerHTML` when displaying user data:

```tsx
// ❌ BAD - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ GOOD - Safe text rendering
<div>{userContent}</div>

// ✅ GOOD - If HTML is needed, sanitize first
import DOMPurify from "dompurify"
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

---

## Summary

### Quick Reference Checklist

When creating new code, ensure:

- [ ] **TypeScript strict mode** - No implicit `any` types
- [ ] **Proper imports** - Use path aliases (`@/...`), follow import order
- [ ] **Naming conventions** - Components `PascalCase`, hooks `useXxx`, utils `camelCase`
- [ ] **Type safety** - All props have interfaces, return types defined
- [ ] **Error handling** - Try-catch in API routes, graceful fallbacks
- [ ] **Performance** - Memoize expensive computations, use dynamic imports for large components
- [ ] **Security** - Validate input, use environment variables correctly, prevent XSS
- [ ] **Accessibility** - Use semantic HTML, ARIA attributes where needed
- [ ] **Formatting** - Run `bun format:fix` before committing
- [ ] **Linting** - No ESLint warnings, run `bun lint`
- [ ] **Testing** - Manual test in browser before submitting

### Useful Commands

```bash
# Format and fix code
bun format:fix
bun lint:fix

# Type checking
bun typecheck

# Run all checks
bun check

# Development
bun dev

# Build for production
bun build
```

---

## References

See the following documentation for more details:

- Next.js 16 (nextjs.org)
- React 19 (react.dev)
- TypeScript 5 (typescriptlang.org)
- Tailwind CSS v4 (tailwindcss.com)
- OnchainKit (onchainkit.xyz)
- Farcaster MiniApp (miniapps.farcaster.xyz)
- Wagmi (wagmi.sh)
- Viem (viem.sh)
- Radix UI (radix-ui.com)

---

**Last Updated:** November 8, 2025
**Version:** 1.0

This document should be reviewed and updated whenever significant patterns emerge in the codebase or when dependencies are upgraded.
