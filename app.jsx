// PHARMASOFT — Main app entry. Manages global state (screen, lang, theme).

const App = () => {
  const [screen, setScreen] = React.useState("login");
  const [lang, setLang] = React.useState("fr");
  const [theme, setTheme] = React.useState("light");
  const [role, setRole] = React.useState("admin");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [theme, lang]);

  // When role changes, auto-redirect to a screen the role can access
  const screenAccessible = (s, r) => {
    const navItem = [...NAV, ...EXTRA_NAV.modules, ...EXTRA_NAV.demos].find(i => (i.screen || i.key) === s);
    if (!navItem) return true; // sub-pages like medicine-detail
    return !navItem.roles || navItem.roles.includes(r);
  };

  const navigate = (s) => { setScreen(s); window.scrollTo(0, 0); };

  const handleRoleChange = (r) => {
    setRole(r);
    if (!screenAccessible(screen, r)) {
      // Pick first available screen for that role
      const defaultScreen = r === "cashier" ? "pos" : r === "assistant" ? "medicines" : "dashboard";
      setScreen(defaultScreen);
    }
  };

  const t = T[lang];

  // Breadcrumbs per screen
  const crumbs = {
    dashboard: [t.dashboard],
    pos: [t.dashboard, t.pos],
    medicines: [t.dashboard, t.medicines],
    "medicine-detail": [t.dashboard, t.medicines, "Doliprane 500mg"],
    stock: [t.dashboard, t.stock],
    clients: [t.dashboard, t.clients],
    "client-detail": [t.dashboard, t.clients, "Ahmed Hassan Ali"],
    prescriptions: [t.dashboard, t.prescriptions],
    suppliers: [t.dashboard, t.suppliers],
    reports: [t.dashboard, t.reports],
    insurance: [t.dashboard, t.insurance],
    notifications: [t.dashboard, t.notifications],
    users: [t.dashboard, t.users],
    settings: [t.dashboard, t.settings],
    caisse: [t.dashboard, t.pos, "Caisse"],
    "ticket-preview": [t.dashboard, t.pos, "Aperçu ticket"],
    "rtl-demo": [t.dashboard, "Démo RTL"],
    "dark-demo": [t.dashboard, "Démo Sombre"],
    "states": [t.dashboard, "États spéciaux"],
  };

  if (screen === "login") {
    return <LoginScreen onLogin={() => navigate("dashboard")} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />;
  }

  const screenMap = {
    dashboard: <DashboardScreen onNavigate={navigate} />,
    pos: <PosScreen onNavigate={navigate} />,
    medicines: <MedicinesScreen onNavigate={navigate} />,
    "medicine-detail": <MedicineDetailScreen onNavigate={navigate} />,
    stock: <StockScreen onNavigate={navigate} />,
    clients: <ClientsScreen onNavigate={navigate} />,
    "client-detail": <ClientDetailScreen onNavigate={navigate} />,
    prescriptions: <PrescriptionsScreen onNavigate={navigate} />,
    suppliers: <SuppliersScreen onNavigate={navigate} />,
    reports: <ReportsScreen onNavigate={navigate} />,
    insurance: <InsuranceScreen onNavigate={navigate} />,
    notifications: <NotificationsScreen onNavigate={navigate} />,
    users: <UsersScreen onNavigate={navigate} />,
    settings: <SettingsScreen onNavigate={navigate} />,
    caisse: <CaisseScreen onNavigate={navigate} />,
    "ticket-preview": <TicketPreviewScreen onNavigate={navigate} />,
    "rtl-demo": <RtlDemoScreen onNavigate={navigate} />,
    "dark-demo": <DarkDemoScreen onNavigate={navigate} />,
    "states": <StatesScreen onNavigate={navigate} />,
  };

  return (
    <AppShell
      activeScreen={screen}
      onNavigate={navigate}
      breadcrumbs={crumbs[screen] || [t.dashboard]}
      lang={lang} setLang={setLang}
      theme={theme} setTheme={setTheme}
      role={role} setRole={handleRoleChange}
    >
      {screenMap[screen] || <DashboardScreen onNavigate={navigate} />}
    </AppShell>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
