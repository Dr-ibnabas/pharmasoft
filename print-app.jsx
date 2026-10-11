// PHARMASOFT — Print app entry. Renders all 20 screens stacked as printable pages.

const PRINT_SCREENS = [
  { key: "login", label: "01 · Login", component: (nav) => <LoginScreen onLogin={() => {}} lang="fr" setLang={() => {}} theme="light" setTheme={() => {}} /> },
  { key: "dashboard", label: "02 · Dashboard", crumb: ["Tableau de bord"], component: (nav) => <DashboardScreen onNavigate={nav} /> },
  { key: "pos", label: "03 · POS Vente", crumb: ["Tableau de bord", "Vente / Caisse"], component: (nav) => <PosScreen onNavigate={nav} /> },
  { key: "medicines", label: "04 · Liste médicaments", crumb: ["Tableau de bord", "Médicaments"], component: (nav) => <MedicinesScreen onNavigate={nav} /> },
  { key: "medicine-detail", label: "05 · Fiche médicament", crumb: ["Tableau de bord", "Médicaments", "Doliprane 500mg"], component: (nav) => <MedicineDetailScreen onNavigate={nav} /> },
  { key: "stock", label: "06 · Stock", crumb: ["Tableau de bord", "Stock"], component: (nav) => <StockScreen onNavigate={nav} /> },
  { key: "clients", label: "07 · Clients", crumb: ["Tableau de bord", "Clients"], component: (nav) => <ClientsScreen onNavigate={nav} /> },
  { key: "client-detail", label: "08 · Fiche client", crumb: ["Tableau de bord", "Clients", "Ahmed Hassan Ali"], component: (nav) => <ClientDetailScreen onNavigate={nav} /> },
  { key: "prescriptions", label: "09 · Ordonnances", crumb: ["Tableau de bord", "Ordonnances"], component: (nav) => <PrescriptionsScreen onNavigate={nav} /> },
  { key: "suppliers", label: "10 · Fournisseurs", crumb: ["Tableau de bord", "Fournisseurs & Achats"], component: (nav) => <SuppliersScreen onNavigate={nav} /> },
  { key: "reports", label: "11 · Rapports", crumb: ["Tableau de bord", "Rapports"], component: (nav) => <ReportsScreen onNavigate={nav} /> },
  { key: "insurance", label: "12 · Assurances", crumb: ["Tableau de bord", "Assurances"], component: (nav) => <InsuranceScreen onNavigate={nav} /> },
  { key: "notifications", label: "13 · Notifications", crumb: ["Tableau de bord", "Notifications"], component: (nav) => <NotificationsScreen onNavigate={nav} /> },
  { key: "users", label: "14 · Utilisateurs", crumb: ["Tableau de bord", "Utilisateurs"], component: (nav) => <UsersScreen onNavigate={nav} /> },
  { key: "settings", label: "15 · Paramètres", crumb: ["Tableau de bord", "Paramètres"], component: (nav) => <SettingsScreen onNavigate={nav} /> },
  { key: "caisse", label: "16 · Caisse", crumb: ["Tableau de bord", "Vente / Caisse", "Caisse"], component: (nav) => <CaisseScreen onNavigate={nav} /> },
  { key: "ticket-preview", label: "17 · Ticket de caisse", crumb: ["Tableau de bord", "Vente / Caisse", "Aperçu ticket"], component: (nav) => <TicketPreviewScreen onNavigate={nav} /> },
  { key: "rtl-demo", label: "18 · Démo Arabe RTL", crumb: ["Tableau de bord", "Démo RTL"], component: (nav) => <RtlDemoScreen onNavigate={nav} /> },
  { key: "dark-demo", label: "19 · Démo Mode sombre", crumb: ["Tableau de bord", "Démo Sombre"], component: (nav) => <DarkDemoScreen onNavigate={nav} /> },
  { key: "states", label: "20 · États spéciaux", crumb: ["Tableau de bord", "États spéciaux"], component: (nav) => <StatesScreen onNavigate={nav} /> },
];

// Print page wrapper — fixed-size 1366×900 frame with optional sidebar+topbar shell
const PrintPage = ({ screen, idx, total }) => {
  const nav = () => {}; // no-op

  // For login (no shell)
  if (screen.key === "login") {
    return (
      <div className="print-page">
        <div className="print-label">{screen.label}</div>
        <div className="print-frame">
          {screen.component(nav)}
        </div>
        <div className="print-footer">PHARMASOFT Djibouti · Maquettes UI · Page {idx + 1} / {total}</div>
      </div>
    );
  }

  // For dark-demo, the screen already has its own dark style, so render with shell anyway
  return (
    <div className="print-page">
      <div className="print-label">{screen.label}</div>
      <div className="print-frame">
        <div className="app-shell" dir="ltr">
          <Sidebar activeScreen={screen.key} onNavigate={nav} lang="fr" theme="light" role="admin" />
          <div className="app-main">
            <Topbar breadcrumbs={screen.crumb} lang="fr" setLang={nav} theme="light" setTheme={nav} onNavigate={nav} role="admin" />
            <main className="app-content">{screen.component(nav)}</main>
          </div>
        </div>
      </div>
      <div className="print-footer">PHARMASOFT Djibouti · Maquettes UI · Page {idx + 1} / {total}</div>
    </div>
  );
};

const PrintApp = () => {
  return (
    <>
      <div className="print-cover">
        <div style={{ position: "absolute", top: 60, left: 60, right: 60, bottom: 60, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
            }}>
              <Icon name="pill" size={32} style={{ color: "white" }} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Maquettes UI · 20 écrans</div>
              <div style={{ fontWeight: 700, fontSize: 36, letterSpacing: "-0.015em", color: "#0F172A" }}>PHARMASOFT</div>
              <div style={{ fontSize: 18, color: "#0EA5E9", fontWeight: 600 }}>Djibouti</div>
            </div>
          </div>
          <div style={{ marginTop: "auto", marginBottom: 40 }}>
            <h1 style={{ fontSize: 64, fontWeight: 700, color: "#0F172A", lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0, maxWidth: 900 }}>
              La gestion intelligente<br/>de votre pharmacie
            </h1>
            <p style={{ marginTop: 24, fontSize: 20, color: "#64748B", maxWidth: 720, lineHeight: 1.5 }}>
              Présentation client — interface complète de gestion pharmacie pensée pour Djibouti.
              Login, POS, médicaments, stock, clients, ordonnances, fournisseurs, rapports, assurances et plus.
            </p>
            <div style={{ marginTop: 40, display: "flex", gap: 48, paddingTop: 32, borderTop: "1px solid #E2E8F0" }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Client</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, color: "#0F172A" }}>Pharmacie Centrale Djibouti</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Plateforme</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, color: "#0F172A" }}>Web Desktop · 1440×900+</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Date</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, color: "#0F172A" }}>27 mai 2026</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Devise</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, color: "#0F172A" }}>Franc Djiboutien (Fdj)</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative shapes */}
        <svg style={{ position: "absolute", top: -200, right: -200, opacity: 0.08 }} width="600" height="600" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="240" fill="none" stroke="#0EA5E9" strokeWidth="60" />
        </svg>
        <svg style={{ position: "absolute", bottom: -100, left: -100, opacity: 0.06 }} width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="160" fill="#10B981" />
        </svg>
      </div>

      {PRINT_SCREENS.map((s, i) => (
        <PrintPage key={s.key} screen={s} idx={i} total={PRINT_SCREENS.length} />
      ))}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<PrintApp />);

// Auto-print once everything is loaded
(async () => {
  // Wait for fonts
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // Small safety delay for charts/SVG rendering
  await new Promise(r => setTimeout(r, 800));
  window.print();
})();
