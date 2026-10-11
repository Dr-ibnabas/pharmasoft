// PHARMASOFT — Layout pour les écrans hors-AppShell (login, mot de passe oublié, …).
// Pas de sidebar/topbar : on laisse la page gérer son design full-screen.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
