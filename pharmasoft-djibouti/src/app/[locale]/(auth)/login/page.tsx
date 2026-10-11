import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LoginForm } from "./login-form";

// PHARMASOFT — Page de login (P2 pixel-perfect).
// Split-screen 1.1fr / 1fr selon la maquette ; côté gauche dégradé sky→émeraude
// avec slogan + stats, côté droit le formulaire.
export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Top-right language switcher (sur les deux colonnes) */}
      <div className="pointer-events-none absolute right-5 top-5 z-10">
        <div className="pointer-events-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <LeftBranding />

      <section className="flex items-center justify-center bg-card p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[380px]">
          <LoginHeader />
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-md bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function LoginHeader() {
  const t = useTranslations("login");
  return (
    <>
      <h1 className="t-h1 mb-1">{t("title")}</h1>
      <p className="t-muted mb-8">{t("subtitle")}</p>
    </>
  );
}

function LeftBranding() {
  const tApp = useTranslations("app");
  const tLogin = useTranslations("login.stats");

  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#10B981] p-12 text-white lg:flex">
      {/* Cercles décoratifs */}
      <svg
        className="pointer-events-none absolute -right-20 -top-20 opacity-[0.15]"
        width="400"
        height="400"
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="160" fill="none" stroke="white" strokeWidth="40" />
      </svg>
      <svg
        className="pointer-events-none absolute -bottom-10 -left-10 opacity-10"
        width="280"
        height="280"
        viewBox="0 0 280 280"
      >
        <circle cx="140" cy="140" r="100" fill="white" />
      </svg>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/25 bg-white/15 backdrop-blur">
          <Logo size={28} className="!bg-transparent !shadow-none" />
        </div>
        <div>
          <div className="text-[17px] font-bold tracking-tight">{tApp("name")}</div>
          <div className="text-[11px] uppercase tracking-widest opacity-85">{tApp("country")}</div>
        </div>
      </div>

      {/* Slogan + sub + stats */}
      <div className="relative z-10 mt-auto mb-10">
        <h2 className="t-display max-w-[520px] !text-white" style={{ fontSize: 44 }}>
          {tApp("slogan")}
        </h2>
        <p className="mt-4 max-w-[480px] text-base/relaxed opacity-90">{tApp("slogan_sub")}</p>

        <div className="mt-9 flex gap-10 border-t border-white/20 pt-6">
          {[
            { v: "12K+", l: tLogin("products") },
            { v: "350+", l: tLogin("pharmacies") },
            { v: "99.9%", l: tLogin("uptime") },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-bold">{s.v}</div>
              <div className="text-xs opacity-85">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-xs opacity-75">{tApp("copyright")}</div>
    </section>
  );
}
