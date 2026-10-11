import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// PHARMASOFT — Squelettes réutilisables pour les états de chargement.

/** Squelette générique pour une liste tabulaire. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="mb-3 h-10 w-72" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Squelette pour les dashboards (KPIs + charts). */
export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Skeleton className="mb-2 h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-3 h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="h-[240px] w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-[180px] w-full" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <Skeleton className="mb-4 h-5 w-56" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Squelette pour les pages de détail (profil + cards). */
export function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-32" />
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Skeleton className="mb-2 h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card className="p-6">
          <Skeleton className="mb-3 h-16 w-16 rounded-2xl" />
          <Skeleton className="mb-2 h-5 w-40" />
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="mb-3 h-5 w-40" />
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
