import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { SettingsForm } from "@/components/parametres/settings-form";
import { BackupPanel } from "@/components/parametres/backup-panel";

export default async function ParametresPage() {
  const session = await auth();
  if (!session?.user) return null;

  const setting = await prisma.setting.findFirst();

  const initial = setting
    ? {
        pharmacyName: setting.pharmacyName,
        address: setting.address,
        city: setting.city,
        phone: setting.phone,
        email: setting.email,
        nif: setting.nif,
        tvaRate: Number(setting.tvaRate),
        defaultLocale: setting.defaultLocale,
        lowStockDefault: setting.lowStockDefault,
        expiryWarnDays: setting.expiryWarnDays,
        expiryAlertDays: setting.expiryAlertDays,
      }
    : {
        pharmacyName: "Pharmacie",
        address: "",
        city: "",
        phone: "",
        email: null,
        nif: "",
        tvaRate: 0.1,
        defaultLocale: "FR" as const,
        lowStockDefault: 20,
        expiryWarnDays: 90,
        expiryAlertDays: 30,
      };

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration de la pharmacie et de l'application"
      />
      <SettingsForm initial={initial} />
      <div className="mt-6">
        <BackupPanel />
      </div>
    </div>
  );
}
