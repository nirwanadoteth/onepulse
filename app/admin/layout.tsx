import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="font-bold text-2xl">DailyRewards Admin</h1>
          <p className="text-muted-foreground text-sm">
            Manage contract settings and operations
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
