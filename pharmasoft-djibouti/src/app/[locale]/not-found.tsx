import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Ghost, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// PHARMASOFT — 404 (capté par Next.js quand notFound() est appelé).
export default function NotFoundPage() {
  const locale = useLocale();
  const t = useTranslations("errors");
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Ghost size={40} />
        </div>
        <div className="t-mono mb-2 text-[80px] font-bold leading-none tracking-tight">404</div>
        <h1 className="t-h2 mb-2">{t("not_found")}</h1>
        <p className="t-muted mb-6 max-w-sm">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Button asChild>
          <Link href={`/${locale}/dashboard`}>
            <Home size={14} />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </main>
  );
}
