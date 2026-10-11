"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

// PHARMASOFT — Formulaire de login (client component).
// Encapsule useSearchParams pour permettre l'usage avec Suspense.
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "titulaire@pharmasoft.dj", password: "Titulaire123!", remember: true },
  });
  const remember = watch("remember");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error(t("error_invalid"));
      return;
    }
    const callbackUrl = params.get("callbackUrl") ?? `/${locale}`;
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email" className="mb-1.5 block">{t("email")}</Label>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 pl-10 text-[15px]"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="mb-1.5 block">{t("password")}</Label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            className="h-11 px-10 text-[15px]"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPwd ? "Masquer" : "Afficher"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setValue("remember", v === true)}
          />
          <span>{t("remember")}</span>
        </label>
        <a href="#" className="text-sm font-medium text-primary hover:underline">{t("forgot")}</a>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t("signin_loading")}
          </span>
        ) : (
          <>
            {t("signin")} <ArrowRight size={16} />
          </>
        )}
      </Button>

      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground">{t("signin_or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="secondary" size="lg" className="w-full" disabled>
        <Key size={16} /> {t("signin_badge")}
      </Button>

      <p className="pt-4 text-center text-xs text-muted-foreground">
        {t("support_question")}{" "}
        <a href="mailto:support@pharmasoft.dj" className="text-primary hover:underline">
          {t("support_link")}
        </a>
      </p>

      <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[11px] text-muted-foreground">
        <div className="mb-1 font-semibold text-foreground">{t("demo_accounts")}</div>
        <ul className="space-y-0.5 font-mono">
          <li>admin@pharmasoft.dj · Admin123!</li>
          <li>titulaire@pharmasoft.dj · Titulaire123!</li>
          <li>vendeur@pharmasoft.dj · Vendeur123!</li>
          <li>caissier@pharmasoft.dj · Caissier123!</li>
        </ul>
      </div>
    </form>
  );
}
