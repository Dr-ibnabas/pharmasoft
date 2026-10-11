import { cn } from "@/lib/utils";

// PHARMASOFT — Entête de page standard : titre + description + actions.
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6", className)}>
      <div className="min-w-0">
        <h1 className="t-h1">{title}</h1>
        {description ? <p className="mt-1 t-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
