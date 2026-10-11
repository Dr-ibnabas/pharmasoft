import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// PHARMASOFT — Page racine.
// - Non connecté → /{locale}/login
// - Connecté → /{locale}/dashboard (toutes les variantes sont là)
export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }
  redirect(`/${locale}/dashboard`);
}
