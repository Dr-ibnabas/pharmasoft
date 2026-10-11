// PHARMASOFT — All screens combined into one file for faster Babel transpilation


// ════════════════════════════════════════════════════════════════════
// screens/_placeholders.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Placeholder screens (to be implemented one by one)
// Each renders a simple "screen coming up" placeholder so the app loads end-to-end.

const Placeholder = ({ title, description, icon = "wrench" }) => (
  <div>
    <div className="page-header">
      <div>
        <h1 className="t-h1" style={{ margin: 0 }}>{title}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>{description}</p>
      </div>
    </div>
    <div className="card" style={{ padding: 64, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 16, background: "var(--bg-sunken)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)",
      }}>
        <Icon name={icon} size={36} />
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Écran en cours de construction</div>
        <div style={{ color: "var(--text-muted)", marginTop: 4 }}>Cette section est dans le pipeline de livraison.</div>
      </div>
    </div>
  </div>
);

window.PosScreen = (p) => <Placeholder title="Vente / Caisse" description="Interface de vente POS" icon="shopping-cart" />;
window.MedicinesScreen = (p) => <Placeholder title="Médicaments" description="Catalogue produits" icon="pill" />;
window.MedicineDetailScreen = (p) => <Placeholder title="Fiche médicament" description="Détail produit" icon="pill" />;
window.StockScreen = (p) => <Placeholder title="Stock" description="Gestion stock & lots" icon="package" />;
window.ClientsScreen = (p) => <Placeholder title="Clients" description="Base clients" icon="users" />;
window.ClientDetailScreen = (p) => <Placeholder title="Fiche client" description="Détail client" icon="user" />;
window.PrescriptionsScreen = (p) => <Placeholder title="Ordonnances" description="Suivi prescriptions" icon="file-text" />;
window.SuppliersScreen = (p) => <Placeholder title="Fournisseurs & Achats" description="Commandes & réceptions" icon="truck" />;
window.ReportsScreen = (p) => <Placeholder title="Rapports" description="Analyses & exports" icon="bar-chart" />;
window.InsuranceScreen = (p) => <Placeholder title="Assurances" description="Bordereaux remboursement" icon="shield" />;
window.NotificationsScreen = (p) => <Placeholder title="Notifications" description="Centre de notifications" icon="bell" />;
window.UsersScreen = (p) => <Placeholder title="Utilisateurs" description="Comptes & permissions" icon="user" />;
window.SettingsScreen = (p) => <Placeholder title="Paramètres" description="Configuration" icon="settings" />;
window.CaisseScreen = (p) => <Placeholder title="Caisse" description="Ouverture & clôture" icon="banknote" />;
window.TicketPreviewScreen = (p) => <Placeholder title="Ticket de caisse" description="Aperçu impression" icon="receipt" />;
window.RtlDemoScreen = (p) => <Placeholder title="Démo Arabe RTL" description="Interface en arabe" icon="globe" />;
window.DarkDemoScreen = (p) => <Placeholder title="Démo Mode sombre" description="Thème sombre" icon="moon" />;
window.StatesScreen = (p) => <Placeholder title="États spéciaux" description="404, erreur, empty" icon="ghost" />;


// ════════════════════════════════════════════════════════════════════
// screens/login.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 1: Login
// Split-screen with branded illustration left, form right.

const LoginScreen = ({ onLogin, lang, setLang, theme, setTheme }) => {
  const t = T[lang];
  const rtl = lang === "ar";
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("amina.farah@pharmacie-centrale.dj");
  const [pwd, setPwd] = React.useState("••••••••••");
  const [remember, setRemember] = React.useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { onLogin(); setLoading(false); }, 900);
  };

  return (
    <div className="login-shell" dir={rtl ? "rtl" : "ltr"}>
      {/* Top-right controls (positioned absolute) */}
      <div style={{
        position: "absolute", top: 20, right: 20, zIndex: 10,
        display: "flex", gap: 8,
      }}>
        <select value={lang} onChange={e => setLang(e.target.value)}
          style={{
            height: 36, padding: "0 28px 0 12px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)",
            color: "white", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            cursor: "pointer", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
          }}>
          <option value="fr" style={{ color: "#0F172A" }}>🇫🇷 Français</option>
          <option value="en" style={{ color: "#0F172A" }}>🇬🇧 English</option>
          <option value="ar" style={{ color: "#0F172A" }}>🇩🇯 العربية</option>
        </select>
      </div>

      {/* LEFT — branded illustration */}
      <div className="login-illu">
        {/* Decorative shapes */}
        <svg style={{ position: "absolute", top: -80, right: -80, opacity: 0.15 }} width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="160" fill="none" stroke="white" strokeWidth="40" />
        </svg>
        <svg style={{ position: "absolute", bottom: -40, left: -40, opacity: 0.1 }} width="280" height="280" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r="100" fill="white" />
        </svg>

        {/* Logo */}
        <div className="row" style={{ gap: 12, zIndex: 2 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.25)",
          }}>
            <Icon name="pill" size={24} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>PHARMASOFT</div>
            <div style={{ fontSize: 11, opacity: 0.85, letterSpacing: "0.08em", textTransform: "uppercase" }}>Djibouti</div>
          </div>
        </div>

        {/* Slogan */}
        <div style={{ marginTop: "auto", marginBottom: 40, zIndex: 2 }}>
          <h1 className="t-display" style={{ margin: 0, color: "white", maxWidth: 520, fontSize: 44, lineHeight: 1.1 }}>
            {t.slogan}
          </h1>
          <p style={{ marginTop: 16, fontSize: 16, opacity: 0.9, maxWidth: 480, lineHeight: 1.55 }}>
            {t.signin_sub}
          </p>

          {/* Stats strip */}
          <div style={{
            marginTop: 36, display: "flex", gap: 40,
            paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.2)",
          }}>
            {[
              { v: "12K+", l: rtl ? "منتج" : "Produits gérés" },
              { v: "350+", l: rtl ? "صيدلية" : "Pharmacies" },
              { v: "99.9%", l: rtl ? "تشغيل" : "Disponibilité" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{s.v}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.75, zIndex: 2 }}>
          © 2026 PHARMASOFT — Tous droits réservés
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="login-form-side">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 className="t-h1" style={{ marginTop: 0, marginBottom: 4 }}>{t.login_title}</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 32 }}>{t.login_sub}</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">{t.email}</label>
              <div className="input-group">
                <span className="input-icon"><Icon name="mail" size={16} /></span>
                <input className="input input-lg" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="field-label">{t.password}</label>
              <div className="input-group">
                <span className="input-icon"><Icon name="lock" size={16} /></span>
                <input className="input input-lg" type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: 0, padding: 6, cursor: "pointer", color: "var(--text-muted)",
                  }}>
                  <Icon name={showPwd ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", userSelect: "none" }}>
                <div onClick={() => setRemember(!remember)} style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `1.5px solid ${remember ? "var(--primary)" : "var(--border-strong)"}`,
                  background: remember ? "var(--primary)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms",
                }}>
                  {remember && <Icon name="check" size={12} style={{ color: "white" }} strokeWidth={3} />}
                </div>
                {t.remember}
              </label>
              <a href="#" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                {t.forgot}
              </a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 0.9s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2 a10 10 0 0 1 10 10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Connexion…
                </>
              ) : (
                <>{t.signin} <Icon name="arrow-right" size={16} /></>
              )}
            </button>
          </form>

          <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>

          <button type="button" className="btn btn-secondary btn-lg" style={{ width: "100%" }}>
            <Icon name="key" size={16} /> Se connecter avec un badge
          </button>

          <p style={{ marginTop: 32, fontSize: 12, color: "var(--text-subtle)", textAlign: "center" }}>
            Besoin d'aide ? <a href="#" style={{ color: "var(--primary)", textDecoration: "none" }}>Contactez le support</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

window.LoginScreen = LoginScreen;


// ════════════════════════════════════════════════════════════════════
// screens/dashboard.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 2: Dashboard
// KPI cards, charts (bars 7-day + donut by category), alerts, top medicines, quick actions.

const KpiCard = ({ label, value, delta, deltaDir = "up", spark, icon, accent }) => (
  <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div className="kpi-label">{label}</div>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: accent + "20", color: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={16} />
      </div>
    </div>
    <div className="kpi-value">{value}</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className={`kpi-delta ${deltaDir}`}>
        <Icon name={deltaDir === "up" ? "trending-up" : "trending-down"} size={12} />
        <span>{delta}</span>
        <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 4 }}>vs hier</span>
      </div>
      {spark && <Sparkline data={spark} width={80} height={28} color={accent} />}
    </div>
  </div>
);

const DashboardScreen = ({ onNavigate }) => {
  const sales7days = [
    { label: "Jeu", value: 142000 },
    { label: "Ven", value: 178000 },
    { label: "Sam", value: 96000 },
    { label: "Dim", value: 88000 },
    { label: "Lun", value: 165000 },
    { label: "Mar", value: 189000 },
    { label: "Mer", value: 152400, highlight: true },
  ];

  const categoryMix = [
    { label: "Antalgiques", value: 28, color: "#EF4444" },
    { label: "Antibiotiques", value: 22, color: "#0EA5E9" },
    { label: "Digestif", value: 16, color: "#10B981" },
    { label: "Cardio", value: 14, color: "#EC4899" },
    { label: "Vitamines", value: 12, color: "#F59E0B" },
    { label: "Autres", value: 8, color: "#94A3B8" },
  ];

  const topMeds = [
    { name: "Doliprane 500mg", qty: 84, revenue: 29400, change: +12 },
    { name: "Amoxicilline 500mg", qty: 42, revenue: 60900, change: +8 },
    { name: "Spasfon", qty: 38, revenue: 18240, change: -3 },
    { name: "Vitamine C 1g", qty: 32, revenue: 13440, change: +18 },
    { name: "Augmentin 1g", qty: 18, revenue: 52020, change: +4 },
  ];

  const alerts = [
    { type: "danger", icon: "alert-circle", count: 3, label: "Péremption urgente", sub: "≤ 30 jours" },
    { type: "warning", icon: "alert-triangle", count: 8, label: "Péremption proche", sub: "≤ 90 jours" },
    { type: "danger", icon: "package", count: 12, label: "Stock faible", sub: "Sous le seuil" },
    { type: "neutral", icon: "x", count: 4, label: "Rupture de stock", sub: "À recommander" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Tableau de bord</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Mercredi 27 mai 2026 — Vue d'ensemble de votre pharmacie
          </p>
        </div>
        <div className="row">
          <div className="switch">
            <button className="switch-opt">7 jours</button>
            <button className="switch-opt active">30 jours</button>
            <button className="switch-opt">90 jours</button>
            <button className="switch-opt">1 an</button>
          </div>
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Exporter</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <KpiCard label="CA du jour" value="152 400 Fdj" delta="+12.4%" deltaDir="up" icon="banknote" accent="#0EA5E9"
          spark={[100, 120, 95, 130, 110, 145, 152]} />
        <KpiCard label="CA semaine" value="892 600 Fdj" delta="+8.1%" deltaDir="up" icon="trending-up" accent="#10B981"
          spark={[80, 95, 70, 60, 85, 110, 92]} />
        <KpiCard label="CA mois" value="3 245 800 Fdj" delta="+18.6%" deltaDir="up" icon="bar-chart" accent="#8B5CF6"
          spark={[200, 240, 280, 260, 310, 340, 324]} />
        <KpiCard label="Panier moyen" value="4 250 Fdj" delta="−2.3%" deltaDir="down" icon="shopping-cart" accent="#F59E0B"
          spark={[42, 44, 46, 45, 44, 43, 42]} />
      </div>

      {/* Charts row */}
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <h3 className="t-h4" style={{ margin: 0 }}>Ventes — 7 derniers jours</h3>
              <p className="t-muted t-small" style={{ margin: "2px 0 0" }}>En Fdj, comparé à la semaine précédente</p>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ background: "var(--primary)" }}></span> Cette sem.
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ background: "var(--secondary)" }}></span> Aujourd'hui
              </span>
            </div>
          </div>
          <BarChart data={sales7days} width={680} height={260} formatValue={v => v >= 1000 ? `${Math.round(v/1000)}k` : v} />
        </div>

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 className="t-h4" style={{ margin: 0 }}>Mix par catégorie</h3>
            <p className="t-muted t-small" style={{ margin: "2px 0 0" }}>Répartition CA du mois</p>
          </div>
          <DonutChart data={categoryMix} size={170} thickness={26} centerLabel="catégories" centerValue="6" />
        </div>
      </div>

      {/* Top meds + Alerts row */}
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="t-h4" style={{ margin: 0 }}>Top 5 médicaments du jour</h3>
            <a href="#" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>Voir tous →</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {topMeds.map((m, i) => (
              <div key={m.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0", borderBottom: i < topMeds.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: i === 0 ? "var(--primary)" : "var(--bg-sunken)",
                  color: i === 0 ? "white" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 12, flexShrink: 0,
                }}>{i + 1}</div>
                <MedImage name={m.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.qty} unités vendues</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{fmtMoney(m.revenue)}</div>
                  <div className={`kpi-delta ${m.change > 0 ? "up" : "down"}`} style={{ justifyContent: "flex-end" }}>
                    <Icon name={m.change > 0 ? "trending-up" : "trending-down"} size={11} />
                    <span>{m.change > 0 ? "+" : ""}{m.change}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 className="t-h4" style={{ margin: 0 }}>Alertes en cours</h3>
              <span className="badge badge-danger">27 actives</span>
            </div>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {alerts.map((a) => (
                <div key={a.label} style={{
                  padding: 14, borderRadius: 10,
                  background: a.type === "danger" ? "var(--danger-50)" : a.type === "warning" ? "var(--warning-50)" : "var(--bg-sunken)",
                  border: "1px solid transparent",
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: a.type === "danger" ? "var(--danger)" : a.type === "warning" ? "var(--warning)" : "var(--text-muted)",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 8,
                  }}>
                    <Icon name={a.icon} size={14} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{a.count}</div>
                  <div style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 className="t-h4" style={{ margin: 0 }}>État de la caisse</h3>
              <span className="badge badge-success badge-dot">Ouverte</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div className="t-muted t-small">Montant théorique</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>178 540 Fdj</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="t-muted t-small">Transactions</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>42</div>
              </div>
            </div>
            <div className="divider" style={{ margin: "12px 0" }}></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
              <span><Icon name="clock" size={11} /> Ouverte depuis 6h 42min</span>
              <span>Caissier : <strong style={{ color: "var(--text)" }}>Idriss A.</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="t-h4" style={{ margin: "0 0 12px" }}>Raccourcis</h3>
        <div className="grid grid-4">
          {[
            { label: "Nouvelle vente", icon: "shopping-cart", color: "#0EA5E9", screen: "pos", shortcut: "F2" },
            { label: "Nouveau client", icon: "user-plus", color: "#10B981", screen: "clients", shortcut: "F3" },
            { label: "Ajouter médicament", icon: "pill", color: "#8B5CF6", screen: "medicines", shortcut: "F4" },
            { label: "Inventaire", icon: "package", color: "#F59E0B", screen: "stock", shortcut: "F5" },
          ].map(a => (
            <div key={a.label} className="card clickable" onClick={() => onNavigate(a.screen)}
              style={{ display: "flex", alignItems: "center", gap: 14, transition: "transform 150ms, box-shadow 150ms" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: a.color + "20", color: a.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={a.icon} size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Raccourci <kbd style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    border: "1px solid var(--border)", padding: "1px 5px",
                    borderRadius: 4, background: "var(--bg-sunken)",
                  }}>{a.shortcut}</kbd>
                </div>
              </div>
              <Icon name="arrow-right" size={16} style={{ color: "var(--text-muted)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.DashboardScreen = DashboardScreen;


// ════════════════════════════════════════════════════════════════════
// screens/pos.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 3: POS Interface (the most important)
// 65/35 split: products grid (left) + cart (right). Realistic pharmacy POS.

const PosScreen = ({ onNavigate }) => {
  const [search, setSearch] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [cart, setCart] = React.useState([
    { id: "M001", name: "Doliprane 500mg", price: 350, qty: 2 },
    { id: "M004", name: "Amoxicilline 500mg", price: 1450, qty: 1 },
    { id: "M008", name: "Smecta", price: 720, qty: 3 },
  ]);
  const [client, setClient] = React.useState(null);
  const [payMethod, setPayMethod] = React.useState("cash");
  const [discount, setDiscount] = React.useState(0);

  // Filter products
  const filtered = MEDICINES.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.dci.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (m) => {
    setCart(prev => {
      const found = prev.find(p => p.id === m.id);
      if (found) return prev.map(p => p.id === m.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { id: m.id, name: m.name, price: m.price, qty: 1 }];
    });
  };
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p).filter(p => p.qty > 0));
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));

  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
  const discountAmount = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * 0.10;
  const total = afterDiscount + tax;

  const payMethods = [
    { id: "cash", label: "Espèces", icon: "banknote", color: "#10B981" },
    { id: "card", label: "Carte", icon: "credit-card", color: "#0EA5E9" },
    { id: "dmoney", label: "D-Money", icon: "smartphone", color: "#F59E0B" },
    { id: "waafi", label: "Waafi", icon: "wallet", color: "#8B5CF6" },
    { id: "insurance", label: "Assurance", icon: "shield", color: "#EC4899" },
    { id: "credit", label: "Crédit", icon: "clock", color: "#64748B" },
  ];

  return (
    <div style={{ margin: -32, minHeight: "calc(100vh - 64px)", display: "grid", gridTemplateColumns: "1fr 440px", background: "var(--bg)" }}>
      {/* LEFT — products */}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Search + scanner */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <span className="input-icon"><Icon name="search" size={18} /></span>
            <input className="input input-lg" placeholder="Rechercher un médicament par nom, DCI, code barre…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 44, paddingRight: 44, fontSize: 15 }} />
            <button style={{
              position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
              width: 32, height: 32, borderRadius: 6, border: 0, background: "var(--primary)", color: "white",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }} title="Scanner code barre">
              <Icon name="scan-line" size={18} />
            </button>
          </div>
          <button className="btn btn-secondary btn-lg" title="Filtres avancés">
            <Icon name="filter" size={16} /> Filtres
          </button>
        </div>

        {/* Categories chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c.id}
              className={`chip ${cat === c.id ? "active" : ""}`}
              onClick={() => setCat(c.id)}
              style={cat !== c.id ? { borderColor: "var(--border)" } : {}}>
              <Icon name={c.icon} size={13} style={{ color: cat === c.id ? "white" : c.color }} />
              {c.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 12, overflowY: "auto", flex: 1, paddingBottom: 12,
        }}>
          {filtered.map(m => (
            <div key={m.id} className="clickable"
              onClick={() => addToCart(m)}
              style={{
                background: "var(--bg-elev)", border: "1px solid var(--border)",
                borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8,
                transition: "all 150ms", cursor: m.status === "out" ? "not-allowed" : "pointer",
                opacity: m.status === "out" ? 0.55 : 1,
              }}
              onMouseEnter={e => { if (m.status !== "out") { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <MedImage name={m.name} size={48} radius={10} />
                {m.prescribed && <span className="badge badge-warning" style={{ height: 18, fontSize: 10 }}>Rx</span>}
              </div>
              <div style={{ minHeight: 36 }}>
                <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.form} · {m.lab}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "var(--font-mono)" }}>{fmtMoney(m.price)}</div>
                <span className={`badge badge-${m.status === "out" ? "danger" : m.status === "low" ? "warning" : "success"}`} style={{ height: 18, fontSize: 10 }}>
                  {m.status === "out" ? "Rupture" : `${m.stock}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — cart */}
      <div style={{
        background: "var(--bg-elev)", borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", position: "sticky", top: 64,
      }}>
        {/* Ticket header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Ticket en cours</div>
              <div style={{ fontWeight: 700, fontSize: 18, fontFamily: "var(--font-mono)" }}>#00425</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setCart([])} disabled={!cart.length}>
              <Icon name="trash" size={14} /> Vider
            </button>
          </div>
          {/* Client */}
          <button onClick={() => setClient(client ? null : CLIENTS[0])}
            style={{
              marginTop: 12, width: "100%", padding: "10px 12px",
              background: client ? "var(--primary-50)" : "var(--bg-sunken)",
              border: `1px dashed ${client ? "var(--primary)" : "var(--border-strong)"}`,
              borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              textAlign: "left", fontFamily: "inherit",
            }}>
            {client ? (
              <>
                <Avatar name={client.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{client.tier} · {client.points} pts</div>
                </div>
                <Icon name="x" size={14} style={{ color: "var(--text-muted)" }} />
              </>
            ) : (
              <>
                <Icon name="user-plus" size={16} style={{ color: "var(--text-muted)" }} />
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>Associer un client (optionnel)</span>
              </>
            )}
          </button>
        </div>

        {/* Cart lines */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <Icon name="shopping-cart" size={48} style={{ opacity: 0.3 }} />
              <div style={{ marginTop: 12, fontWeight: 500 }}>Aucun produit dans le panier</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Recherchez ou scannez pour commencer</div>
            </div>
          ) : (
            cart.map(line => (
              <div key={line.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: 10, borderRadius: 10, marginBottom: 4,
                background: "transparent",
              }}>
                <MedImage name={line.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{line.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {fmtMoney(line.price)} × {line.qty} = <strong style={{ color: "var(--text)" }}>{fmtMoney(line.price * line.qty)}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => updateQty(line.id, -1)} style={{
                    width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-elev)", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "var(--text)",
                  }}><Icon name="minus" size={12} /></button>
                  <span style={{ minWidth: 22, textAlign: "center", fontWeight: 600, fontSize: 13 }}>{line.qty}</span>
                  <button onClick={() => updateQty(line.id, +1)} style={{
                    width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-elev)", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "var(--text)",
                  }}><Icon name="plus" size={12} /></button>
                </div>
                <button onClick={() => removeFromCart(line.id)} style={{
                  background: "none", border: 0, padding: 4, cursor: "pointer", color: "var(--text-subtle)",
                }} title="Retirer"><Icon name="x" size={14} /></button>
              </div>
            ))
          )}
        </div>

        {/* Totals + Payment */}
        <div style={{ borderTop: "1px solid var(--border)", padding: 20, background: "var(--bg-sunken)" }}>
          {/* Sub-totals */}
          <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="t-muted">Sous-total</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="t-muted">Remise</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select value={discount} onChange={e => setDiscount(+e.target.value)}
                  style={{
                    height: 24, padding: "0 6px", fontSize: 11, borderRadius: 4,
                    border: "1px solid var(--border)", background: "var(--bg-elev)", color: "var(--text)",
                  }}>
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                </select>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--danger)" }}>−{fmtMoney(discountAmount)}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="t-muted">TVA 10%</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(tax)}</span>
            </div>
          </div>
          <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>TOTAL</span>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>{fmtMoney(total)}</span>
          </div>

          {/* Payment methods */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
            {payMethods.map(p => (
              <button key={p.id} onClick={() => setPayMethod(p.id)}
                style={{
                  padding: "10px 6px", borderRadius: 8,
                  border: `1.5px solid ${payMethod === p.id ? p.color : "var(--border)"}`,
                  background: payMethod === p.id ? p.color + "15" : "var(--bg-elev)",
                  color: payMethod === p.id ? p.color : "var(--text)",
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  fontFamily: "inherit", fontSize: 11, fontWeight: 500,
                  transition: "all 150ms",
                }}>
                <Icon name={p.icon} size={18} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Cash button */}
          <button className="btn btn-success" style={{
            width: "100%", height: 56, fontSize: 17, fontWeight: 700,
            background: cart.length ? "var(--success)" : "var(--bg-elev)",
            color: cart.length ? "white" : "var(--text-subtle)",
            border: cart.length ? "0" : "1px solid var(--border)",
          }} disabled={!cart.length} onClick={() => onNavigate("ticket-preview")}>
            <Icon name="check-circle" size={20} /> ENCAISSER {fmtMoney(total)}
          </button>

          {/* Keyboard shortcuts */}
          <div style={{
            marginTop: 12, padding: "8px 10px", background: "var(--bg-elev)",
            borderRadius: 6, border: "1px solid var(--border)",
            display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "var(--text-muted)",
          }}>
            {[
              ["F1", "Aide"], ["F2", "Vente"], ["F3", "Client"],
              ["F4", "Remise"], ["F5", "Encaisser"], ["Esc", "Annuler"]
            ].map(([k, l]) => (
              <span key={k} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <kbd style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                  border: "1px solid var(--border)", padding: "1px 4px",
                  borderRadius: 3, background: "var(--bg-sunken)",
                }}>{k}</kbd>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.PosScreen = PosScreen;


// ════════════════════════════════════════════════════════════════════
// screens/medicines.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 4: Medicines list

const MedicinesScreen = ({ onNavigate }) => {
  const [view, setView] = React.useState("table"); // table | grid
  const [selected, setSelected] = React.useState([]);
  const [filterCat, setFilterCat] = React.useState("Tous");
  const [filterRx, setFilterRx] = React.useState("Tous");

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === MEDICINES.length ? [] : MEDICINES.map(m => m.id));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Médicaments</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            {MEDICINES.length} produits dans le catalogue · 348 actifs · 23 alertes
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="upload" size={14} /> Import CSV</button>
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Exporter</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Ajouter médicament</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: 10 }}>
          <div className="input-group">
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input" placeholder="Rechercher par nom, DCI, code…" />
          </div>
          <select className="input">
            <option>Toutes catégories</option>
            <option>Antalgiques</option>
            <option>Antibiotiques</option>
            <option>Respiratoire</option>
            <option>Digestif</option>
            <option>Cardio</option>
          </select>
          <select className="input">
            <option>Tous laboratoires</option>
            <option>Sanofi</option>
            <option>GSK</option>
            <option>Pfizer</option>
            <option>Novartis</option>
          </select>
          <select className="input">
            <option>Tous statuts</option>
            <option>En stock</option>
            <option>Stock faible</option>
            <option>Rupture</option>
          </select>
          <select className="input">
            <option>Ordonnance — Tous</option>
            <option>Libre service</option>
            <option>Sur ordonnance</option>
            <option>Contrôlé</option>
          </select>
          <div className="switch">
            <button className={`switch-opt ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>
              <Icon name="list" size={14} />
            </button>
            <button className={`switch-opt ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>
              <Icon name="grid" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="card" style={{
          padding: "10px 16px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--primary-50)", borderColor: "var(--primary)",
        }}>
          <strong>{selected.length} sélectionné(s)</strong>
          <div style={{ height: 18, width: 1, background: "var(--border-strong)" }}></div>
          <button className="btn btn-ghost btn-sm"><Icon name="tag" size={14} /> Changer catégorie</button>
          <button className="btn btn-ghost btn-sm"><Icon name="edit" size={14} /> Mise à jour prix</button>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> Exporter</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}><Icon name="trash" size={14} /> Supprimer</button>
          <span className="spacer"></span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Annuler</button>
        </div>
      )}

      {/* Content */}
      {view === "table" ? (
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.length === MEDICINES.length}
                    onChange={toggleAll}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--primary)" }} />
                </th>
                <th>Produit</th>
                <th>DCI</th>
                <th>Catégorie</th>
                <th>Laboratoire</th>
                <th>Stock</th>
                <th>Prix vente</th>
                <th>Statut</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {MEDICINES.map(m => (
                <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("medicine-detail")}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(m.id)}
                      onChange={() => toggle(m.id)}
                      style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--primary)" }} />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <MedImage name={m.name} size={36} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.form} · {m.dosage}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{m.dci}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: 11 }}>{m.cat}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{m.lab}</td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{m.stock}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(m.price)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span className={`badge badge-${m.status === "out" ? "danger" : m.status === "low" ? "warning" : "success"} badge-dot`}>
                        {m.status === "out" ? "Rupture" : m.status === "low" ? "Faible" : "OK"}
                      </span>
                      {m.prescribed && <span className="badge badge-primary" style={{ fontSize: 10 }}>Rx</span>}
                      {m.controlled && <span className="badge badge-danger" style={{ fontSize: 10 }}>Contrôlé</span>}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}>
                      <Icon name="more-horizontal" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Affichage <strong style={{ color: "var(--text)" }}>1–20</strong> sur 348 produits
            </div>
            <div className="row">
              <select className="input" style={{ width: "auto", height: 32, fontSize: 13 }}>
                <option>20 / page</option><option>50 / page</option><option>100 / page</option>
              </select>
              <div className="row" style={{ gap: 4 }}>
                <button className="icon-btn" disabled style={{ width: 32, height: 32, opacity: 0.5 }}><Icon name="chevron-left" size={14} /></button>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} className="icon-btn" style={{
                    width: 32, height: 32, fontWeight: 500,
                    background: n === 1 ? "var(--primary)" : "transparent",
                    color: n === 1 ? "white" : "var(--text)",
                  }}>{n}</button>
                ))}
                <span style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>
                <button className="icon-btn" style={{ width: 32, height: 32 }}>18</button>
                <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="chevron-right" size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Grid view
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {MEDICINES.map(m => (
            <div key={m.id} className="card clickable" onClick={() => onNavigate("medicine-detail")}
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <MedImage name={m.name} size={56} radius={12} />
                <div style={{ display: "flex", gap: 4 }}>
                  {m.prescribed && <span className="badge badge-primary" style={{ fontSize: 10 }}>Rx</span>}
                  {m.controlled && <span className="badge badge-danger" style={{ fontSize: 10 }}>Contrôlé</span>}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.dci}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>{m.cat}</span>
                <span className={`badge badge-${m.status === "out" ? "danger" : m.status === "low" ? "warning" : "success"}`}>
                  {m.stock} en stock
                </span>
              </div>
              <div style={{ height: 1, background: "var(--border)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.lab}</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtMoney(m.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

window.MedicinesScreen = MedicinesScreen;


// ════════════════════════════════════════════════════════════════════
// screens/medicine-detail.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 5: Medicine detail (Doliprane 500mg as example)

const MedicineDetailScreen = ({ onNavigate }) => {
  const [tab, setTab] = React.useState("info");
  const med = {
    name: "Doliprane 500mg",
    dci: "Paracétamol",
    form: "Comprimé sécable",
    dosage: "500 mg",
    lab: "Sanofi-Aventis France",
    cat: "Antalgique / Antipyrétique",
    code: "3400934028144",
    price: 350,
    price_buy: 220,
    tva: 10,
    margin: 37.1,
    stock: 248,
    minStock: 50,
    prescribed: false,
    therapeutic: "Douleur légère à modérée, fièvre. Adulte et enfant > 27 kg.",
    posology: "1 à 2 comprimés, à renouveler si nécessaire au bout de 4h. Max 8/jour.",
    contraindications: "Hypersensibilité au paracétamol. Insuffisance hépatocellulaire sévère.",
    interactions: "Alcool, anticoagulants oraux (potentialise warfarine).",
  };

  const lots = [
    { lot: "DOL24-A012", qty: 124, exp: "2027-08-15", supplier: "UBIPHAR", buyPrice: 220, days: 446 },
    { lot: "DOL24-B038", qty: 84, exp: "2027-02-20", supplier: "COPHARMED", buyPrice: 215, days: 270 },
    { lot: "DOL23-C091", qty: 40, exp: "2026-09-10", supplier: "UBIPHAR", buyPrice: 218, days: 107 },
  ];

  const sales = [
    { date: "27 mai 2026 · 14:32", client: "Halima Y.", qty: 2, total: 700 },
    { date: "27 mai 2026 · 11:08", client: "Comptoir", qty: 1, total: 350 },
    { date: "27 mai 2026 · 09:45", client: "Ahmed H.", qty: 4, total: 1400 },
    { date: "26 mai 2026 · 17:20", client: "Khadija A.", qty: 2, total: 700 },
    { date: "26 mai 2026 · 15:11", client: "Comptoir", qty: 1, total: 350 },
    { date: "26 mai 2026 · 10:33", client: "Omar Ali", qty: 6, total: 2100 },
  ];

  const sales6mo = [
    { label: "Déc", value: 580 },
    { label: "Jan", value: 720 },
    { label: "Fév", value: 654 },
    { label: "Mar", value: 812 },
    { label: "Avr", value: 942 },
    { label: "Mai", value: 1086 },
  ];

  return (
    <div>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("medicines")} style={{ marginBottom: 12, padding: "4px 8px" }}>
        <Icon name="chevron-left" size={14} /> Retour au catalogue
      </button>

      {/* Header */}
      <div className="card" style={{ display: "flex", gap: 24, padding: 24, marginBottom: 16 }}>
        <MedImage name={med.name} size={120} radius={16} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span className="badge badge-neutral">{med.cat}</span>
            {med.prescribed
              ? <span className="badge badge-primary">Sur ordonnance</span>
              : <span className="badge badge-success">Libre service</span>}
            <span className="badge badge-warning">Antalgique niveau 1</span>
          </div>
          <h1 className="t-h1" style={{ margin: 0 }}>{med.name}</h1>
          <p style={{ margin: "4px 0 12px", color: "var(--text-muted)", fontSize: 15 }}>
            <strong style={{ color: "var(--text)" }}>DCI :</strong> {med.dci} · {med.form} · {med.lab}
          </p>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div className="t-muted t-small">Prix de vente</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtMoney(med.price)}</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }}></div>
            <div>
              <div className="t-muted t-small">Stock total</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{med.stock} <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>unités</span></div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }}></div>
            <div>
              <div className="t-muted t-small">Marge</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--success)" }}>{med.margin}%</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }}></div>
            <div>
              <div className="t-muted t-small">Code barre</div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 6 }}>{med.code}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary"><Icon name="edit" size={14} /> Modifier</button>
          <button className="btn btn-secondary"><Icon name="shopping-cart" size={14} /> Vendre</button>
          <button className="btn btn-secondary"><Icon name="printer" size={14} /> Étiquettes</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          ["info", "Informations", "info"],
          ["lots", "Stock par lot", "package"],
          ["history", "Historique ventes", "history"],
          ["stats", "Statistiques", "bar-chart"],
        ].map(([k, l, i]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            <Icon name={i} size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
            {l}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "info" && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Caractéristiques produit</h3>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 24px", fontSize: 14 }}>
              <span className="t-muted">Forme</span><span>{med.form}</span>
              <span className="t-muted">Dosage</span><span>{med.dosage}</span>
              <span className="t-muted">Laboratoire</span><span>{med.lab}</span>
              <span className="t-muted">Catégorie</span><span>{med.cat}</span>
              <span className="t-muted">Code CIP</span><span style={{ fontFamily: "var(--font-mono)" }}>{med.code}</span>
              <span className="t-muted">AMM</span><span>FR-2018-1234</span>
              <span className="t-muted">Conditionnement</span><span>Plaquette de 16 cps</span>
              <span className="t-muted">Conservation</span><span>≤ 30°C, à l'abri de l'humidité</span>
            </div>
          </div>
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Prix & marges</h3>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 24px", fontSize: 14 }}>
              <span className="t-muted">Prix d'achat HT</span><span style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(med.price_buy)}</span>
              <span className="t-muted">Prix de vente TTC</span><span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(med.price)}</span>
              <span className="t-muted">TVA</span><span>{med.tva}%</span>
              <span className="t-muted">Marge brute</span><span style={{ color: "var(--success)", fontWeight: 600 }}>{med.margin}%</span>
              <span className="t-muted">Stock seuil</span><span>{med.minStock} unités</span>
              <span className="t-muted">Stock actuel</span><span>{med.stock} unités</span>
              <span className="t-muted">Valeur stock</span><span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(med.stock * med.price_buy)}</span>
            </div>
          </div>
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Informations cliniques</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Indications thérapeutiques</div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>{med.therapeutic}</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Posologie</div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>{med.posology}</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--danger)" }}>Contre-indications</div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>{med.contraindications}</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--warning)" }}>Interactions médicamenteuses</div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>{med.interactions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "lots" && (
        <div className="card card-flush">
          <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
            <strong>3 lots actifs · {lots.reduce((s, l) => s + l.qty, 0)} unités au total</strong>
            <button className="btn btn-secondary btn-sm"><Icon name="plus" size={14} /> Nouveau lot</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>N° Lot</th><th>Quantité</th><th>Date péremption</th><th>Jours restants</th>
                <th>Fournisseur</th><th>PA unitaire</th><th>Valeur</th><th></th>
              </tr>
            </thead>
            <tbody>
              {lots.map(l => {
                const status = l.days < 90 ? "warning" : l.days < 30 ? "danger" : "success";
                return (
                  <tr key={l.lot}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{l.lot}</td>
                    <td style={{ fontWeight: 600 }}>{l.qty}</td>
                    <td>{fmtDate(l.exp)}</td>
                    <td>
                      <span className={`badge badge-${status}`}>{l.days} jours</span>
                    </td>
                    <td>{l.supplier}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(l.buyPrice)}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(l.qty * l.buyPrice)}</td>
                    <td><button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more-horizontal" size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "history" && (
        <div className="card">
          <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Ventes récentes</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sales.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "12px 0", borderBottom: i < sales.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: "var(--secondary-50)", color: "var(--secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}><Icon name="shopping-cart" size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{s.client === "Comptoir" ? "Vente au comptoir" : s.client}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.date} · {s.qty} unité(s)</div>
                </div>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{fmtMoney(s.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Ventes — 6 derniers mois</h3>
            <BarChart data={sales6mo} height={280} formatValue={v => v + " u"} />
          </div>
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Top 5 clients acheteurs</h3>
            <HBarChart data={[
              { label: "Halima Youssouf", value: 64, color: "#0EA5E9" },
              { label: "Ahmed Hassan", value: 48, color: "#10B981" },
              { label: "Khadija Abdou", value: 36, color: "#8B5CF6" },
              { label: "Omar Ali", value: 28, color: "#F59E0B" },
              { label: "Mohamed Farah", value: 22, color: "#EC4899" },
            ]} formatValue={v => v + " u"} />
          </div>
        </div>
      )}
    </div>
  );
};

window.MedicineDetailScreen = MedicineDetailScreen;


// ════════════════════════════════════════════════════════════════════
// screens/stock.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 6: Stock management with lots & expiry tracking

const StockScreen = ({ onNavigate }) => {
  const [filter, setFilter] = React.useState("all");

  // Generate lot data
  const lots = [
    { med: "Doliprane 500mg", lot: "DOL24-A012", qty: 124, exp: "2027-08-15", days: 446, buy: 220, status: "ok" },
    { med: "Doliprane 1g", lot: "DOL1-B091", qty: 88, exp: "2027-04-22", days: 331, buy: 380, status: "ok" },
    { med: "Efferalgan 1g", lot: "EFF24-C042", qty: 18, exp: "2026-07-30", days: 65, buy: 420, status: "warning" },
    { med: "Amoxicilline 500mg", lot: "AMX-D118", qty: 56, exp: "2027-01-12", days: 231, buy: 980, status: "ok" },
    { med: "Augmentin 1g", lot: "AUG-E024", qty: 42, exp: "2026-09-08", days: 105, buy: 2100, status: "ok" },
    { med: "Ventoline 100µg", lot: "VTL-F009", qty: 7, exp: "2026-06-18", days: 23, buy: 1320, status: "danger" },
    { med: "Spasfon 80mg", lot: "SPF-G201", qty: 156, exp: "2028-02-11", days: 626, buy: 320, status: "ok" },
    { med: "Smecta 3g", lot: "SMC-H087", qty: 92, exp: "2027-11-25", days: 548, buy: 480, status: "ok" },
    { med: "Voltarène 50mg", lot: "VLT-I014", qty: 0, exp: "—", days: 0, buy: 680, status: "rupture" },
    { med: "Inexium 40mg", lot: "INX-J053", qty: 5, exp: "2026-06-25", days: 30, buy: 1450, status: "danger" },
    { med: "Stilnox 10mg", lot: "STL-K072", qty: 14, exp: "2027-03-19", days: 296, buy: 1580, status: "ok" },
    { med: "Vitamine C 1g", lot: "VTC-L101", qty: 178, exp: "2028-05-10", days: 714, buy: 280, status: "ok" },
  ];

  const filtered = filter === "all" ? lots :
    filter === "low" ? lots.filter(l => l.status === "warning" || l.status === "danger") :
    filter === "rupture" ? lots.filter(l => l.status === "rupture") :
    filter === "ok" ? lots.filter(l => l.status === "ok") :
    lots.filter(l => l.days > 0 && l.days < 90);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Gestion du stock</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Lots, péremption et valorisation du stock
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Export</button>
          <button className="btn btn-secondary"><Icon name="archive" size={14} /> Ajustement</button>
          <button className="btn btn-primary"><Icon name="clipboard" size={14} /> Nouvel inventaire</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Valeur totale du stock</div>
              <div className="kpi-value">12 450 000 Fdj</div>
              <div className="kpi-delta up"><Icon name="trending-up" size={12} /> +4.2% vs mois dernier</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="banknote" size={22} />
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Produits actifs</div>
              <div className="kpi-value">348</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>sur 412 référencés · 1 248 lots</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--secondary-50)", color: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="package" size={22} />
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Alertes</div>
              <div className="kpi-value" style={{ color: "var(--danger)" }}>23</div>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: "var(--danger)" }}>3 urgentes</span> · <span style={{ color: "var(--warning)" }}>12 faibles</span> · <span className="t-muted">8 péremption</span>
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--danger-50)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="alert-triangle" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="input-group" style={{ flex: "1 1 280px" }}>
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input" placeholder="Rechercher médicament, n° lot…" />
          </div>
          <div className="switch">
            {[
              ["all", "Tous", lots.length],
              ["ok", "OK", lots.filter(l => l.status === "ok").length],
              ["low", "Faible", lots.filter(l => l.status !== "ok" && l.status !== "rupture").length],
              ["rupture", "Rupture", lots.filter(l => l.status === "rupture").length],
              ["expiry", "Péremption", lots.filter(l => l.days > 0 && l.days < 90).length],
            ].map(([k, l, n]) => (
              <button key={k} className={`switch-opt ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>
                {l} <span style={{ marginLeft: 4, padding: "1px 6px", background: filter === k ? "var(--primary-50)" : "var(--border)", color: filter === k ? "var(--primary-600)" : "var(--text-muted)", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{n}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lots table */}
      <div className="card card-flush" style={{ marginBottom: 24 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Médicament</th>
              <th>N° Lot</th>
              <th>Quantité</th>
              <th>Date péremption</th>
              <th>Jours restants</th>
              <th>Prix achat</th>
              <th>Valeur totale</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MedImage name={l.med} size={32} />
                    <div style={{ fontWeight: 500 }}>{l.med}</div>
                  </div>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 13 }}>{l.lot}</td>
                <td style={{ fontWeight: 600 }}>{l.qty}</td>
                <td>{l.exp === "—" ? <span className="t-muted">—</span> : fmtDate(l.exp)}</td>
                <td>
                  {l.status === "rupture" ? (
                    <span className="badge badge-danger">Rupture</span>
                  ) : (
                    <span className={`badge badge-${l.days < 30 ? "danger" : l.days < 90 ? "warning" : "success"} badge-dot`}>
                      {l.days} j
                    </span>
                  )}
                </td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(l.buy)}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(l.qty * l.buy)}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="edit" size={14} /></button>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more-horizontal" size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* À détruire */}
      <div className="card" style={{ borderColor: "var(--danger)", background: "var(--danger-50)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 className="t-h4" style={{ margin: 0, color: "var(--danger)" }}>
              <Icon name="trash" size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
              Produits à détruire
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              Produits périmés ou rappelés en attente de procédure de destruction
            </p>
          </div>
          <button className="btn btn-danger btn-sm"><Icon name="trash" size={14} /> Lancer procédure</button>
        </div>
        <div style={{ background: "var(--bg-elev)", borderRadius: 8, padding: 12 }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead style={{ display: "none" }}><tr><th></th></tr></thead>
            <tbody>
              {[
                { med: "Aspirine 500mg", lot: "ASP-X042", qty: 38, exp: "2026-04-12", reason: "Périmé" },
                { med: "Lasilix 40mg", lot: "LSX-Y011", qty: 12, exp: "2026-03-28", reason: "Périmé" },
                { med: "Pédiatril sirop", lot: "PED-Z087", qty: 5, exp: "—", reason: "Rappel laboratoire" },
              ].map((d, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MedImage name={d.med} size={28} />
                      <strong>{d.med}</strong>
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{d.lot}</td>
                  <td>{d.qty} unités</td>
                  <td className="t-muted">{d.exp === "—" ? "—" : fmtDate(d.exp)}</td>
                  <td><span className="badge badge-danger">{d.reason}</span></td>
                  <td><button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}>Sortir du stock</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

window.StockScreen = StockScreen;


// ════════════════════════════════════════════════════════════════════
// screens/clients.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 7: Clients list (card grid)

const ClientCard = ({ client, onClick }) => {
  const tc = tierColor(client.tier);
  return (
    <div className="card clickable" onClick={onClick}
      style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, transition: "all 150ms" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={client.name} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600 }} className="truncate">{client.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="phone" size={11} /> {client.phone}
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
          background: tc.bg, color: tc.color,
        }}>
          <Icon name="award" size={11} style={{ verticalAlign: "-2px", marginRight: 3 }} />{client.tier}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span className="badge badge-neutral" style={{ fontSize: 11 }}>
          <Icon name="map-pin" size={11} /> {client.quarter}
        </span>
        {client.allergies && client.allergies.length > 0 && (
          <span className="badge badge-danger" style={{ fontSize: 11 }}>
            <Icon name="alert-circle" size={11} /> Allergies
          </span>
        )}
        {client.conditions && client.conditions.length > 0 && (
          <span className="badge badge-warning" style={{ fontSize: 11 }}>
            <Icon name="activity" size={11} /> {client.conditions[0]}
          </span>
        )}
      </div>

      <div style={{ height: 1, background: "var(--border)" }}></div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total achats</div>
          <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{fmtMoney(client.total)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Dernière visite</div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{fmtDate(client.lastVisit)}</div>
        </div>
      </div>
    </div>
  );
};

const ClientsScreen = ({ onNavigate }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Clients</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Base clientèle et programme de fidélité
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Exporter</button>
          <button className="btn btn-primary"><Icon name="user-plus" size={14} /> Ajouter un client</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Clients total", value: "1 247", icon: "users", color: "#0EA5E9", delta: "+24 ce mois" },
          { label: "Nouveaux ce mois", value: "89", icon: "user-plus", color: "#10B981", delta: "+12% vs avril" },
          { label: "Clients fidèles", value: "234", icon: "award", color: "#F59E0B", delta: "Or & Platine" },
          { label: "Crédit en cours", value: "245k Fdj", icon: "wallet", color: "#EF4444", delta: "18 clients" },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="kpi-label">{s.label}</div>
                <div className="kpi-value">{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.delta}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color + "20", color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
          <div className="input-group">
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input" placeholder="Nom, téléphone, numéro client…" />
          </div>
          <select className="input">
            <option>Tous quartiers</option>
            <option>Plateau du Serpent</option><option>Héron</option><option>Haramous</option>
            <option>Balbala</option><option>Gabode</option><option>PK12</option>
          </select>
          <select className="input">
            <option>Tous niveaux</option>
            <option>Bronze</option><option>Argent</option><option>Or</option><option>Platine</option>
          </select>
          <select className="input">
            <option>Allergies — Tous</option>
            <option>Pénicilline</option><option>Aspirine</option><option>Sulfamides</option>
          </select>
          <select className="input">
            <option>Crédit — Tous</option>
            <option>Avec crédit en cours</option><option>Sans crédit</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        {CLIENTS.map(c => (
          <ClientCard key={c.id} client={c} onClick={() => onNavigate("client-detail")} />
        ))}
      </div>

      {/* Floating add btn */}
      <button onClick={() => {}} style={{
        position: "fixed", bottom: 32, right: 32, width: 56, height: 56, borderRadius: 999,
        background: "var(--primary)", color: "white", border: 0,
        boxShadow: "var(--shadow-lg)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, transition: "transform 150ms",
      }} title="Ajouter un client"
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <Icon name="plus" size={26} strokeWidth={2.4} />
      </button>
    </div>
  );
};

window.ClientsScreen = ClientsScreen;


// ════════════════════════════════════════════════════════════════════
// screens/client-detail.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 8: Client detail

const ClientDetailScreen = ({ onNavigate }) => {
  const [tab, setTab] = React.useState("info");
  const c = CLIENTS[0]; // Ahmed Hassan Ali
  const tc = tierColor(c.tier);

  const purchases = [
    { date: "2026-05-25 · 16:42", items: ["Doliprane 500mg ×2", "Smecta ×3", "Vitamine C ×1"], total: 3680, ticket: "#00424" },
    { date: "2026-05-18 · 11:15", items: ["Augmentin 1g ×1", "Doliprane 500mg ×2"], total: 3590, ticket: "#00387" },
    { date: "2026-05-12 · 14:22", items: ["Spasfon ×2", "Imodium ×1"], total: 1850, ticket: "#00352" },
    { date: "2026-05-04 · 09:51", items: ["Doliprane 1g ×1", "Magné B6 ×1", "Tot'héma ×2"], total: 5040, ticket: "#00298" },
    { date: "2026-04-28 · 17:08", items: ["Ventoline ×1"], total: 1850, ticket: "#00261" },
  ];

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("clients")} style={{ marginBottom: 12, padding: "4px 8px" }}>
        <Icon name="chevron-left" size={14} /> Retour aux clients
      </button>

      {/* Header */}
      <div className="card" style={{ padding: 24, marginBottom: 16, display: "flex", gap: 24 }}>
        <Avatar name={c.name} size="xl" />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
              background: tc.bg, color: tc.color,
            }}>
              <Icon name="award" size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
              {c.tier} · {c.points} points
            </span>
            <span className="badge badge-primary">VIP</span>
            <span className="badge badge-danger">Allergie pénicilline</span>
          </div>
          <h1 className="t-h1" style={{ margin: 0 }}>{c.name}</h1>
          <div style={{ display: "flex", gap: 20, marginTop: 12, color: "var(--text-muted)", fontSize: 14 }}>
            <span><Icon name="phone" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />{c.phone}</span>
            <span><Icon name="map-pin" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />{c.quarter}</span>
            <span><Icon name="calendar" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />Client depuis Mars 2023</span>
            <span><Icon name="user" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />ID {c.id}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary"><Icon name="shopping-cart" size={14} /> Nouvelle vente</button>
          <button className="btn btn-secondary"><Icon name="edit" size={14} /> Modifier</button>
          <button className="btn btn-secondary"><Icon name="send" size={14} /> Envoyer SMS</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="t-muted t-small">Total achats</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtMoney(c.total)}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Sur 18 visites</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="t-muted t-small">Panier moyen</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtMoney(c.total / 18)}</div>
          <div style={{ fontSize: 11, color: "var(--success)" }}>+18% vs moyenne</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="t-muted t-small">Points fidélité</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: tc.color }}>{c.points} pts</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>~ {Math.round(c.points * 5)} Fdj remise</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="t-muted t-small">Crédit en cours</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--danger)" }}>0 Fdj</div>
          <div style={{ fontSize: 11, color: "var(--success)" }}>Aucun retard</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          ["info", "Informations", "user"],
          ["history", "Historique achats", "history"],
          ["rx", "Ordonnances", "file-text"],
          ["loyalty", "Fidélité", "award"],
          ["credit", "Crédit", "wallet"],
        ].map(([k, l, i]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            <Icon name={i} size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />{l}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Données personnelles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 24px", fontSize: 14 }}>
              <span className="t-muted">Nom complet</span><span>{c.name}</span>
              <span className="t-muted">Date de naissance</span><span>14 août 1968 · 57 ans</span>
              <span className="t-muted">Sexe</span><span>Masculin</span>
              <span className="t-muted">CIN</span><span style={{ fontFamily: "var(--font-mono)" }}>DJ-198468-7842</span>
              <span className="t-muted">Téléphone</span><span>{c.phone}</span>
              <span className="t-muted">Email</span><span>ahmed.hassan@gmail.dj</span>
              <span className="t-muted">Adresse</span><span>{c.quarter}, Djibouti-ville</span>
              <span className="t-muted">Assurance</span><span><span className="badge badge-primary">CNSS Djibouti</span></span>
            </div>
          </div>
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Données médicales</h3>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 24px", fontSize: 14 }}>
              <span className="t-muted">Groupe sanguin</span><span style={{ fontWeight: 600 }}>O+</span>
              <span className="t-muted">Poids</span><span>78 kg</span>
              <span className="t-muted">Taille</span><span>1.74 m</span>
              <span className="t-muted">Médecin traitant</span><span>Dr. Mahdi Bouh</span>
            </div>
            <div className="divider" style={{ margin: "16px 0" }}></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--danger)" }}>
                <Icon name="alert-circle" size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />Allergies connues
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.allergies.map(a => <span key={a} className="badge badge-danger">{a}</span>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <Icon name="activity" size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />Pathologies chroniques
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="badge badge-warning">Hypertension légère</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="card">
          <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Timeline des achats — 5 dernières visites</h3>
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: "var(--border)" }}></div>
            {purchases.map((p, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 24 }}>
                <div style={{
                  position: "absolute", left: -22, top: 4, width: 20, height: 20, borderRadius: 999,
                  background: "var(--bg-elev)", border: `2px solid ${i === 0 ? "var(--primary)" : "var(--border-strong)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="shopping-cart" size={10} style={{ color: i === 0 ? "var(--primary)" : "var(--text-muted)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{p.date} · Ticket {p.ticket}</div>
                    <div style={{ marginTop: 4, fontSize: 14 }}>{p.items.join(" · ")}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 16 }}>{fmtMoney(p.total)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "rx" && (
        <div className="grid grid-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                aspectRatio: "1 / 1.3", background: "var(--bg-sunken)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-subtle)", flexDirection: "column", gap: 10,
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(0,0,0,0.025) 12px, rgba(0,0,0,0.025) 14px)`,
              }}>
                <Icon name="file-text" size={48} />
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>scan-ordonnance-{i}.jpg</span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Ordonnance #ORD-2026-0{42 + i}</strong>
                  <span className="badge badge-success">Délivrée</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Dr. Mahdi Bouh</div>
                <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>{fmtDate("2026-0" + (5 - i) + "-15")}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "loyalty" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
          {/* Loyalty card visual */}
          <div style={{
            background: `linear-gradient(135deg, ${tc.color} 0%, ${tc.color}99 100%)`,
            borderRadius: 16, padding: 24, color: "white",
            position: "relative", overflow: "hidden", aspectRatio: "1.6 / 1",
          }}>
            <svg style={{ position: "absolute", right: -40, bottom: -40, opacity: 0.15 }} width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="20"/>
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.9 }}>PHARMASOFT</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Carte de fidélité</div>
              </div>
              <Icon name="award" size={28} />
            </div>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.04em" }}>{c.name.toUpperCase()}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, fontFamily: "var(--font-mono)" }}>#{c.id}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>POINTS</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{c.points}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, textTransform: "uppercase" }}>{c.tier}</div>
            </div>
          </div>

          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 16px" }}>Progression vers le prochain niveau</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Platine</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{c.points} / 2000 pts</span>
              </div>
              <div style={{ height: 10, background: "var(--bg-sunken)", borderRadius: 999 }}>
                <div style={{
                  height: "100%", width: `${(c.points / 2000) * 100}%`,
                  background: `linear-gradient(90deg, ${tc.color}, var(--primary))`,
                  borderRadius: 999,
                }}></div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                Plus que <strong style={{ color: "var(--text)" }}>{2000 - c.points} points</strong> pour atteindre Platine et débloquer 15% de remise permanente
              </div>
            </div>

            <div className="divider"></div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Historique des points</div>
              {[
                { date: "25 mai", action: "Achat ticket #00424", delta: +36 },
                { date: "18 mai", action: "Achat ticket #00387", delta: +35 },
                { date: "15 mai", action: "Bonus anniversaire", delta: +100 },
                { date: "12 mai", action: "Achat ticket #00352", delta: +18 },
                { date: "1 mai", action: "Échange remise 500 Fdj", delta: -100 },
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: "1px solid var(--border)", fontSize: 13,
                }}>
                  <span><span className="t-muted" style={{ marginRight: 8 }}>{p.date}</span>{p.action}</span>
                  <span style={{ fontWeight: 600, color: p.delta > 0 ? "var(--success)" : "var(--danger)", fontFamily: "var(--font-mono)" }}>
                    {p.delta > 0 ? "+" : ""}{p.delta} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "credit" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 999,
              background: "var(--success-50)", color: "var(--success)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Icon name="check-circle" size={40} />
            </div>
            <div className="t-muted">Solde dû</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--success)", fontFamily: "var(--font-mono)" }}>0 Fdj</div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Ce client n'a aucun encours.<br/>Plafond de crédit autorisé : <strong>50 000 Fdj</strong></p>
            <button className="btn btn-primary" style={{ marginTop: 12 }}><Icon name="wallet" size={14} /> Encaisser un paiement</button>
          </div>
          <div className="card">
            <h3 className="t-h4" style={{ margin: "0 0 12px" }}>Historique paiements</h3>
            <table className="table">
              <thead><tr><th>Date</th><th>Type</th><th>Référence</th><th style={{ textAlign: "right" }}>Montant</th></tr></thead>
              <tbody>
                {[
                  { date: "2026-05-18", type: "Règlement", ref: "PAY-218", amount: 14400 },
                  { date: "2026-04-30", type: "Crédit", ref: "TKT-#00198", amount: -8500 },
                  { date: "2026-04-22", type: "Règlement", ref: "PAY-186", amount: 5900 },
                  { date: "2026-04-10", type: "Crédit", ref: "TKT-#00142", amount: -5900 },
                ].map((p, i) => (
                  <tr key={i}>
                    <td>{fmtDate(p.date)}</td>
                    <td>{p.type === "Règlement"
                      ? <span className="badge badge-success">Règlement</span>
                      : <span className="badge badge-warning">Crédit</span>}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{p.ref}</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: p.amount > 0 ? "var(--success)" : "var(--danger)" }}>
                      {p.amount > 0 ? "+" : ""}{fmtMoney(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

window.ClientDetailScreen = ClientDetailScreen;


// ════════════════════════════════════════════════════════════════════
// screens/prescriptions.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 9: Prescriptions list + detail view

const PrescriptionsScreen = ({ onNavigate }) => {
  const [view, setView] = React.useState("list"); // list | detail
  const [filter, setFilter] = React.useState("all");

  const prescriptions = [
    { id: "ORD-2026-0042", date: "2026-05-27", doc: "Dr. Mahdi Bouh", client: "Ahmed Hassan Ali", meds: 3, status: "pending", expires: "2026-08-27" },
    { id: "ORD-2026-0041", date: "2026-05-27", doc: "Dr. Fatima Aden", client: "Halima Youssouf Aden", meds: 5, status: "partial", expires: "2026-08-27" },
    { id: "ORD-2026-0040", date: "2026-05-26", doc: "Dr. Mahdi Bouh", client: "Khadija Abdou Youssouf", meds: 2, status: "delivered", expires: "2026-08-26" },
    { id: "ORD-2026-0039", date: "2026-05-26", doc: "Dr. Ismail Said", client: "Omar Ali Hassan", meds: 4, status: "delivered", expires: "2026-08-26" },
    { id: "ORD-2026-0038", date: "2026-05-25", doc: "Dr. Fatima Aden", client: "Fatouma Mohamed Omar", meds: 3, status: "pending", expires: "2026-08-25" },
    { id: "ORD-2026-0037", date: "2026-05-24", doc: "Dr. Mahdi Bouh", client: "Ibrahim Said Mohamed", meds: 2, status: "delivered", expires: "2026-08-24" },
    { id: "ORD-2026-0036", date: "2026-04-20", doc: "Dr. Houssein Ali", client: "Hassan Bouh Hassan", meds: 4, status: "expired", expires: "2026-07-20" },
  ];

  const statusInfo = {
    pending: { label: "En attente", badge: "warning" },
    partial: { label: "Partielle", badge: "primary" },
    delivered: { label: "Délivrée", badge: "success" },
    expired: { label: "Expirée", badge: "neutral" },
  };

  const filtered = filter === "all" ? prescriptions : prescriptions.filter(p => p.status === filter);

  if (view === "detail") {
    return <PrescriptionDetail onBack={() => setView("list")} />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Ordonnances</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Suivi des prescriptions médicales — 248 ordonnances ce mois
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="upload" size={14} /> Scanner</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Nouvelle ordonnance</button>
        </div>
      </div>

      {/* Status switcher */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="input-group" style={{ flex: 1 }}>
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input" placeholder="N° ordonnance, médecin, client…" />
          </div>
          <input type="date" className="input" style={{ width: 160 }} defaultValue="2026-05-27" />
          <select className="input" style={{ width: 200 }}>
            <option>Tous médecins</option>
            <option>Dr. Mahdi Bouh</option>
            <option>Dr. Fatima Aden</option>
            <option>Dr. Ismail Said</option>
          </select>
          <div className="switch">
            {[
              ["all", "Toutes"],
              ["pending", "En attente"],
              ["partial", "Partielles"],
              ["delivered", "Délivrées"],
              ["expired", "Expirées"],
            ].map(([k, l]) => (
              <button key={k} className={`switch-opt ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filtered.map(p => {
          const st = statusInfo[p.status];
          return (
            <div key={p.id} className="card clickable" onClick={() => setView("detail")}
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Scan preview */}
              <div style={{
                aspectRatio: "1.4 / 1", background: "var(--bg-sunken)", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 6, color: "var(--text-subtle)",
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(0,0,0,0.025) 12px, rgba(0,0,0,0.025) 14px)`,
              }}>
                <Icon name="file-text" size={32} />
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>scan-{p.id}.jpg</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{p.id}</strong>
                <span className={`badge badge-${st.badge}`}>{st.label}</span>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.client}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  <Icon name="stethoscope" size={11} style={{ verticalAlign: "-2px", marginRight: 3 }} />{p.doc}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
                <span><Icon name="calendar" size={11} style={{ verticalAlign: "-2px", marginRight: 3 }} />{fmtDate(p.date)}</span>
                <span>{p.meds} médicaments</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PrescriptionDetail = ({ onBack }) => {
  const lines = [
    { name: "Augmentin 1g", dosage: "1 cp × 3/jour pendant 7 jours", qty: 21, delivered: 21, ok: true },
    { name: "Doliprane 500mg", dosage: "1 cp si douleur, max 4/jour", qty: 16, delivered: 16, ok: true },
    { name: "Smecta 3g", dosage: "1 sachet × 3/jour pendant 5 jours", qty: 15, delivered: 0, ok: true },
    { name: "Aspégic 1000", dosage: "1 sachet × 2/jour", qty: 14, delivered: 0, ok: false },
  ];
  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 12, padding: "4px 8px" }}>
        <Icon name="chevron-left" size={14} /> Retour à la liste
      </button>

      <div className="page-header">
        <div>
          <h1 className="t-h2" style={{ margin: 0 }}>Ordonnance <span style={{ fontFamily: "var(--font-mono)" }}>ORD-2026-0042</span></h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            <strong style={{ color: "var(--text)" }}>Ahmed Hassan Ali</strong> · Prescription du 27 mai 2026 · Dr. Mahdi Bouh
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="printer" size={14} /> Imprimer</button>
          <button className="btn btn-primary"><Icon name="check-circle" size={14} /> Délivrer la suite</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        {/* Scan */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Scan original</strong>
            <div className="row" style={{ gap: 4 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="search" size={14} /></button>
              <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="download" size={14} /></button>
            </div>
          </div>
          <div style={{
            flex: 1, minHeight: 480,
            background: "white",
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
            backgroundSize: "100% 24px",
            position: "relative",
            color: "#0F172A",
            padding: 24,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.8,
          }}>
            <div style={{ textAlign: "center", fontFamily: "var(--font-sans)", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Dr. MAHDI BOUH</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Médecin généraliste · Centre Médical Plateau</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>RPPS 10234567 · +253 21 33 22 11</div>
            </div>
            <div style={{ borderTop: "1px solid #ddd", paddingTop: 12 }}>
              <div>Patient : <strong>Ahmed Hassan Ali</strong></div>
              <div>Âge : 57 ans · Poids : 78kg</div>
              <div>Date : 27/05/2026</div>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, marginBottom: 8 }}>Prescription</div>
              <div>1. Augmentin 1g — 1 cp ×3/j · 7 jours</div>
              <div>2. Doliprane 500mg — 1 cp si douleur</div>
              <div>3. Smecta 3g — 1 sachet ×3/j · 5 jours</div>
              <div>4. Aspégic 1000 — 1 sachet ×2/j</div>
            </div>
            <div style={{ position: "absolute", bottom: 24, right: 24, opacity: 0.7 }}>
              <div style={{
                fontFamily: "cursive", fontSize: 24,
                transform: "rotate(-8deg)", color: "#0EA5E9",
              }}>Dr.MB</div>
              <div style={{ fontSize: 9, color: "#94A3B8", textAlign: "center" }}>Signature & cachet</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="col">
          {/* Interaction warning */}
          <div className="card" style={{ background: "var(--danger-50)", borderColor: "var(--danger)", padding: 14, display: "flex", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: "var(--danger)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Icon name="alert-triangle" size={18} /></div>
            <div>
              <div style={{ fontWeight: 600 }}>1 interaction détectée</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>
                <strong>Aspégic 1000 + Doliprane 500mg</strong> — Surdosage paracétamol possible. Vérifier dose journalière cumulée.
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                ⚠️ Allergie patient à la <strong style={{ color: "var(--danger)" }}>pénicilline</strong> — l'Augmentin contient un antibiotique de la famille des pénicillines.
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="card card-flush">
            <div style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Lignes prescrites</strong>
              <span className="badge badge-primary">2 / 4 délivrées</span>
            </div>
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Médicament</th><th>Posologie</th><th>Qté</th><th>Délivré</th><th></th></tr></thead>
              <tbody>
                {lines.map(l => (
                  <tr key={l.name}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MedImage name={l.name} size={28} />
                        <strong>{l.name}</strong>
                        {!l.ok && <Icon name="alert-circle" size={14} style={{ color: "var(--danger)" }} />}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.dosage}</td>
                    <td>{l.qty}</td>
                    <td>
                      {l.delivered === l.qty
                        ? <span className="badge badge-success badge-dot">{l.delivered}/{l.qty}</span>
                        : l.delivered > 0
                          ? <span className="badge badge-warning badge-dot">{l.delivered}/{l.qty}</span>
                          : <span className="badge badge-neutral badge-dot">{l.delivered}/{l.qty}</span>
                      }
                    </td>
                    <td>
                      {l.delivered < l.qty && <button className="btn btn-ghost btn-sm" style={{ color: "var(--primary)" }}>Délivrer →</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

window.PrescriptionsScreen = PrescriptionsScreen;


// ════════════════════════════════════════════════════════════════════
// screens/suppliers.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 10: Suppliers & Purchase orders

const SuppliersScreen = ({ onNavigate }) => {
  const [tab, setTab] = React.useState("suppliers");

  const orders = [
    { id: "BC-2026-0124", supplier: "UBIPHAR Djibouti", date: "2026-05-26", items: 18, total: 1245000, status: "in_transit" },
    { id: "BC-2026-0123", supplier: "COPHARMED", date: "2026-05-24", items: 12, total: 786000, status: "received" },
    { id: "BC-2026-0122", supplier: "MEDIPHARMA DJ", date: "2026-05-22", items: 24, total: 1840000, status: "received" },
    { id: "BC-2026-0121", supplier: "UBIPHAR Djibouti", date: "2026-05-20", items: 8, total: 412000, status: "received" },
    { id: "BC-2026-0120", supplier: "PHARMACOP", date: "2026-05-18", items: 15, total: 980000, status: "draft" },
    { id: "BC-2026-0119", supplier: "DJIB-PHARMA", date: "2026-05-15", items: 22, total: 1654000, status: "cancelled" },
  ];

  const orderStatus = {
    draft: { label: "Brouillon", badge: "neutral" },
    sent: { label: "Envoyée", badge: "primary" },
    in_transit: { label: "En cours", badge: "warning" },
    received: { label: "Réceptionnée", badge: "success" },
    cancelled: { label: "Annulée", badge: "danger" },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Fournisseurs & Achats</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Gestion des fournisseurs, commandes et réceptions
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Export</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Nouveau bon de commande</button>
        </div>
      </div>

      <div className="tabs">
        {[
          ["suppliers", "Fournisseurs", "truck"],
          ["orders", "Commandes", "file-text"],
          ["receptions", "Réceptions", "package"],
          ["invoices", "Factures", "receipt"],
        ].map(([k, l, i]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            <Icon name={i} size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />{l}
          </button>
        ))}
      </div>

      {tab === "suppliers" && (
        <div className="grid grid-2">
          {SUPPLIERS.map(s => (
            <div key={s.id} className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 18, flexShrink: 0,
              }}>{s.name.split(" ")[0].slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      <Icon name="user" size={11} style={{ verticalAlign: "-2px", marginRight: 3 }} />{s.contact}
                    </div>
                  </div>
                  {s.balance > 0
                    ? <span className="badge badge-warning">{fmtMoney(s.balance)} dû</span>
                    : <span className="badge badge-success badge-dot">À jour</span>}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
                  <span><Icon name="phone" size={11} /> {s.phone}</span>
                  <span><Icon name="calendar" size={11} /> Dernière cmde {fmtDate(s.lastOrder)}</span>
                </div>
                <div className="divider" style={{ margin: "12px 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn btn-ghost btn-sm"><Icon name="plus" size={13} /> Commander</button>
                    <button className="btn btn-ghost btn-sm">Voir détails →</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr><th>N° Bon</th><th>Fournisseur</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ cursor: "pointer" }}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>{o.id}</td>
                  <td><strong>{o.supplier}</strong></td>
                  <td>{fmtDate(o.date)}</td>
                  <td>{o.items}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(o.total)}</td>
                  <td><span className={`badge badge-${orderStatus[o.status].badge} badge-dot`}>{orderStatus[o.status].label}</span></td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="eye" size={14} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="printer" size={14} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more-horizontal" size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === "receptions" || tab === "invoices") && (
        <div className="card" style={{ padding: 24 }}>
          {/* Demonstrate creating a new purchase order */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="t-h4" style={{ margin: 0 }}>
              {tab === "receptions" ? "Réception en cours — UBIPHAR Djibouti" : "Facture FACT-2026-0089 — COPHARMED"}
            </h3>
            <span className="badge badge-warning badge-dot">{tab === "receptions" ? "En cours" : "À régler"}</span>
          </div>

          <div className="grid grid-3" style={{ marginBottom: 20, gap: 10 }}>
            <div>
              <div className="t-muted t-small">N° Bon</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>BC-2026-0124</div>
            </div>
            <div>
              <div className="t-muted t-small">Date livraison prévue</div>
              <div style={{ fontWeight: 500 }}>28 mai 2026</div>
            </div>
            <div>
              <div className="t-muted t-small">Conditions paiement</div>
              <div style={{ fontWeight: 500 }}>30 jours fin de mois</div>
            </div>
          </div>

          <table className="table" style={{ marginBottom: 20 }}>
            <thead><tr><th>Produit</th><th>Qté commandée</th><th>Qté reçue</th><th>PA unitaire</th><th>Total HT</th></tr></thead>
            <tbody>
              {MEDICINES.slice(0, 6).map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MedImage name={m.name} size={28} />
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td>{60 + m.stock % 40}</td>
                  <td>
                    <input className="input" style={{ width: 80, height: 30, fontSize: 13 }} defaultValue={60 + m.stock % 40} />
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(Math.round(m.price * 0.65))}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney((60 + m.stock % 40) * Math.round(m.price * 0.65))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 320 }}>
              {[
                ["Sous-total HT", "1 245 000 Fdj"],
                ["TVA 10%", "124 500 Fdj"],
                ["Frais de port", "8 500 Fdj"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span className="t-muted">{k}</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{v}</span>
                </div>
              ))}
              <div className="divider" style={{ margin: "8px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 700, fontSize: 16 }}>
                <span>TOTAL TTC</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>1 378 000 Fdj</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }}><Icon name="save" size={14} /> Brouillon</button>
                <button className="btn btn-primary" style={{ flex: 1 }}><Icon name="check" size={14} /> Valider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.SuppliersScreen = SuppliersScreen;


// ════════════════════════════════════════════════════════════════════
// screens/reports.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 11: Reports

const ReportsScreen = ({ onNavigate }) => {
  const [report, setReport] = React.useState("sales");

  const reports = [
    { id: "sales", label: "Ventes globales", icon: "trending-up", group: "Ventes" },
    { id: "products", label: "Ventes par produit", icon: "pill", group: "Ventes" },
    { id: "categories", label: "Ventes par catégorie", icon: "tag", group: "Ventes" },
    { id: "cashier", label: "Performance caissiers", icon: "user", group: "Ventes" },
    { id: "stock-state", label: "État du stock", icon: "package", group: "Stock" },
    { id: "expiry", label: "Péremptions", icon: "alert-triangle", group: "Stock" },
    { id: "rotation", label: "Rotation des stocks", icon: "refresh", group: "Stock" },
    { id: "clients", label: "Top clients", icon: "users", group: "Clients" },
    { id: "loyalty", label: "Fidélité", icon: "award", group: "Clients" },
    { id: "suppliers", label: "Achats fournisseurs", icon: "truck", group: "Achats" },
    { id: "insurance", label: "Assurances", icon: "shield", group: "Finances" },
    { id: "fiscal", label: "Rapport fiscal", icon: "file-text", group: "Finances" },
  ];

  const grouped = reports.reduce((acc, r) => {
    (acc[r.group] = acc[r.group] || []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Rapports</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Analyses détaillées et exports comptables
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "flex-start" }}>
        {/* Sidebar reports */}
        <div className="card" style={{ padding: 8, position: "sticky", top: 80 }}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.06em", color: "var(--text-subtle)",
                padding: "8px 10px 4px",
              }}>{group}</div>
              {items.map(r => (
                <div key={r.id} onClick={() => setReport(r.id)}
                  className={`nav-item ${report === r.id ? "active" : ""}`}
                  style={{ fontSize: 13, padding: "8px 10px" }}>
                  <Icon name={r.icon} size={15} className="nav-item-icon" />
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Report content */}
        <div>
          {/* Period & filters */}
          <div className="card" style={{ padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <strong style={{ marginRight: 8 }}>Période :</strong>
            <div className="switch">
              <button className="switch-opt">Aujourd'hui</button>
              <button className="switch-opt">7 jours</button>
              <button className="switch-opt active">30 jours</button>
              <button className="switch-opt">3 mois</button>
              <button className="switch-opt">Année</button>
            </div>
            <input type="date" className="input" style={{ width: 140 }} defaultValue="2026-04-27" />
            <span className="t-muted">→</span>
            <input type="date" className="input" style={{ width: 140 }} defaultValue="2026-05-27" />
            <span className="spacer"></span>
            <button className="btn btn-secondary"><Icon name="filter" size={14} /> Filtres</button>
            <button className="btn btn-primary"><Icon name="refresh" size={14} /> Actualiser</button>
          </div>

          {/* Report — Sales */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h2 className="t-h2" style={{ margin: 0 }}>Rapport — Ventes globales</h2>
                <p style={{ color: "var(--text-muted)", margin: "2px 0 0", fontSize: 13 }}>Du 27 avril au 27 mai 2026</p>
              </div>
              <div className="row">
                <button className="btn btn-secondary"><Icon name="printer" size={14} /> Imprimer</button>
                <button className="btn btn-secondary"><Icon name="download" size={14} /> Excel</button>
                <button className="btn btn-primary"><Icon name="file-text" size={14} /> Export PDF</button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
              {[
                { l: "CA total période", v: "3 245 800 Fdj", d: "+18.6%", up: true },
                { l: "Transactions", v: "768", d: "+12.4%", up: true },
                { l: "Panier moyen", v: "4 226 Fdj", d: "+5.5%", up: true },
                { l: "Marge brute", v: "1 142 030 Fdj", d: "35.2%", up: true },
              ].map(s => (
                <div key={s.l} className="card" style={{ padding: 16 }}>
                  <div className="t-muted t-small">{s.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{s.v}</div>
                  <div className={`kpi-delta ${s.up ? "up" : "down"}`}>
                    <Icon name={s.up ? "trending-up" : "trending-down"} size={11} />
                    <span>{s.d}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 className="t-h4" style={{ margin: "0 0 12px" }}>Évolution CA quotidien</h3>
              <LineChart data={[
                { label: "27/4", value: 84000 },
                { label: "1/5", value: 102000 },
                { label: "5/5", value: 142000 },
                { label: "9/5", value: 118000 },
                { label: "13/5", value: 165000 },
                { label: "17/5", value: 138000 },
                { label: "21/5", value: 156000 },
                { label: "25/5", value: 178000 },
                { label: "27/5", value: 152400 },
              ]} formatValue={v => `${Math.round(v/1000)}k`} height={280}/>
            </div>

            {/* Two charts */}
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
              <div className="card">
                <h3 className="t-h4" style={{ margin: "0 0 12px" }}>Mix par catégorie</h3>
                <DonutChart data={[
                  { label: "Antalgiques", value: 28, color: "#EF4444" },
                  { label: "Antibiotiques", value: 22, color: "#0EA5E9" },
                  { label: "Digestif", value: 16, color: "#10B981" },
                  { label: "Cardio", value: 14, color: "#EC4899" },
                  { label: "Vitamines", value: 12, color: "#F59E0B" },
                  { label: "Autres", value: 8, color: "#94A3B8" },
                ]} size={180} thickness={26} centerLabel="Total" centerValue="100%" />
              </div>
              <div className="card">
                <h3 className="t-h4" style={{ margin: "0 0 12px" }}>Top 5 produits</h3>
                <HBarChart data={[
                  { label: "Doliprane 500mg", value: 142400, color: "#0EA5E9" },
                  { label: "Augmentin 1g", value: 98200, color: "#10B981" },
                  { label: "Amoxicilline 500mg", value: 87500, color: "#8B5CF6" },
                  { label: "Spasfon", value: 56800, color: "#F59E0B" },
                  { label: "Smecta", value: 42100, color: "#EC4899" },
                ]} formatValue={v => fmtMoney(v)} />
              </div>
            </div>

            {/* Detailed table */}
            <div className="card card-flush">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                <strong>Détail des ventes par jour</strong>
              </div>
              <table className="table">
                <thead><tr><th>Date</th><th>Transactions</th><th>CA brut</th><th>Remises</th><th>TVA</th><th>CA net</th><th>Variation</th></tr></thead>
                <tbody>
                  {[
                    { d: "2026-05-27", tx: 42, ca: 162400, rem: 4200, tva: 14800, net: 152400, var: 12.4 },
                    { d: "2026-05-26", tx: 38, ca: 198000, rem: 3500, tva: 18000, net: 189000, var: -1.6 },
                    { d: "2026-05-25", tx: 35, ca: 172000, rem: 2800, tva: 15600, net: 165000, var: 21.2 },
                    { d: "2026-05-24", tx: 28, ca: 92000, rem: 1500, tva: 8400, net: 88000, var: -8.4 },
                    { d: "2026-05-23", tx: 24, ca: 99000, rem: 1700, tva: 9000, net: 96000, var: -46.0 },
                  ].map(r => (
                    <tr key={r.d}>
                      <td style={{ fontWeight: 500 }}>{fmtDate(r.d)}</td>
                      <td>{r.tx}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(r.ca)}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>−{fmtMoney(r.rem)}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{fmtMoney(r.tva)}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fmtMoney(r.net)}</td>
                      <td>
                        <span className={`kpi-delta ${r.var > 0 ? "up" : "down"}`}>
                          <Icon name={r.var > 0 ? "trending-up" : "trending-down"} size={11} />
                          {r.var > 0 ? "+" : ""}{r.var}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ReportsScreen = ReportsScreen;


// ════════════════════════════════════════════════════════════════════
// screens/insurance.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 12: Insurance & Reimbursements

const InsuranceScreen = ({ onNavigate }) => {
  const [view, setView] = React.useState("list");

  if (view === "bordereau") return <BordereauView onBack={() => setView("list")} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Assurances</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Mutuelles, prises en charge et bordereaux de remboursement
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Export</button>
          <button className="btn btn-primary" onClick={() => setView("bordereau")}>
            <Icon name="file-text" size={14} /> Générer bordereau
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { l: "Créances totales", v: "3 607 000 Fdj", icon: "wallet", color: "#EF4444", d: "5 assurances" },
          { l: "Adhérents couverts", v: "1 399", icon: "users", color: "#0EA5E9", d: "+42 ce mois" },
          { l: "Tiers payant ce mois", v: "892 400 Fdj", icon: "shield", color: "#10B981", d: "184 ventes" },
          { l: "Reçus en attente", v: "12", icon: "clock", color: "#F59E0B", d: "à pointer" },
        ].map(s => (
          <div key={s.l} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="kpi-label">{s.l}</div>
                <div className="kpi-value">{s.v}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.d}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color + "20", color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insurance table */}
      <div className="card card-flush">
        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <strong>5 assurances actives</strong>
          <button className="btn btn-secondary btn-sm"><Icon name="plus" size={14} /> Ajouter assurance</button>
        </div>
        <table className="table">
          <thead>
            <tr><th>Assurance</th><th>% Prise en charge</th><th>Adhérents</th><th>Créances en cours</th><th>Dernier paiement</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {INSURANCES.map(ins => (
              <tr key={ins.id} style={{ cursor: "pointer" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "var(--primary-50)", color: "var(--primary-600)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Icon name="shield" size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{ins.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Convention #{ins.id.replace("I", "CV-")}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 80, height: 8, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: ins.coverage + "%", height: "100%", background: "var(--primary)" }}></div>
                    </div>
                    <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{ins.coverage}%</span>
                  </div>
                </td>
                <td><strong>{ins.members}</strong></td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--danger)" }}>{fmtMoney(ins.due)}</td>
                <td className="t-muted" style={{ fontSize: 13 }}>15 avril 2026</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setView("bordereau")}>
                      <Icon name="file-text" size={13} /> Bordereau
                    </button>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more-horizontal" size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BordereauView = ({ onBack }) => {
  const lines = [
    { date: "2026-05-26", ticket: "#00424", client: "Ahmed Hassan Ali", id: "DJ-198468", total: 12400, taken: 9920 },
    { date: "2026-05-25", ticket: "#00418", client: "Halima Youssouf", id: "DJ-197642", total: 8600, taken: 6880 },
    { date: "2026-05-24", ticket: "#00412", client: "Khadija Abdou", id: "DJ-198812", total: 5400, taken: 4320 },
    { date: "2026-05-22", ticket: "#00398", client: "Omar Ali Hassan", id: "DJ-196534", total: 14800, taken: 11840 },
    { date: "2026-05-20", ticket: "#00389", client: "Fatouma Mohamed", id: "DJ-197901", total: 6200, taken: 4960 },
  ];
  const sum = lines.reduce((s, l) => s + l.taken, 0);

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 12, padding: "4px 8px" }}>
        <Icon name="chevron-left" size={14} /> Retour aux assurances
      </button>

      <div className="page-header">
        <div>
          <h1 className="t-h2" style={{ margin: 0 }}>Bordereau de remboursement</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>CNSS Djibouti · Période du 1 au 26 mai 2026</p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="printer" size={14} /> Imprimer</button>
          <button className="btn btn-primary"><Icon name="download" size={14} /> Générer PDF</button>
        </div>
      </div>

      <div className="card" style={{ padding: 32, background: "white", color: "#0F172A" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #0EA5E9, #10B981)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Icon name="pill" size={22} style={{ color: "white" }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{PHARMACY.name}</div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
              {PHARMACY.address}<br/>{PHARMACY.city}<br/>Tél : {PHARMACY.phone}<br/>NIF : {PHARMACY.nif}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "#0EA5E9", color: "white", padding: "8px 12px", borderRadius: 8, display: "inline-block", marginBottom: 8 }}>
              <strong>BORDEREAU DE REMBOURSEMENT</strong>
            </div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
              N° : <strong style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}>BORD-2026-0042</strong><br/>
              Date d'émission : 27/05/2026<br/>
              Période : 01/05 → 26/05/2026
            </div>
          </div>
        </div>

        <div style={{ background: "#F1F5F9", padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Destinataire</div>
          <div style={{ fontSize: 14 }}>
            <strong>CNSS DJIBOUTI</strong> — Direction des prestations<br/>
            Avenue 13, Djibouti-ville · Convention CV-001<br/>
            Taux de prise en charge : <strong>80%</strong>
          </div>
        </div>

        <table className="table" style={{ marginBottom: 20 }}>
          <thead style={{ background: "#0F172A" }}>
            <tr style={{ color: "white" }}>
              <th style={{ color: "white", background: "#0F172A" }}>Date</th>
              <th style={{ color: "white", background: "#0F172A" }}>Ticket</th>
              <th style={{ color: "white", background: "#0F172A" }}>Bénéficiaire</th>
              <th style={{ color: "white", background: "#0F172A" }}>N° Adhérent</th>
              <th style={{ color: "white", background: "#0F172A" }}>Total ticket</th>
              <th style={{ color: "white", background: "#0F172A" }}>Pris en charge</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(l => (
              <tr key={l.ticket}>
                <td>{fmtDate(l.date)}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{l.ticket}</td>
                <td><strong>{l.client}</strong></td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{l.id}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(l.total)}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(l.taken)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 280, background: "#F1F5F9", padding: 16, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid #E2E8F0" }}>
              <span style={{ color: "#64748B", fontSize: 13 }}>Nb actes</span>
              <span style={{ fontWeight: 600 }}>{lines.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E2E8F0" }}>
              <span style={{ color: "#64748B", fontSize: 13 }}>Total brut</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(lines.reduce((s, l) => s + l.total, 0))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontWeight: 700, fontSize: 16 }}>
              <span>À REMBOURSER</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "#0EA5E9" }}>{fmtMoney(sum)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8" }}>
          <div>Document généré par PHARMASOFT le 27/05/2026 à 14:42</div>
          <div>Page 1 / 1</div>
        </div>
      </div>
    </div>
  );
};

window.InsuranceScreen = InsuranceScreen;


// ════════════════════════════════════════════════════════════════════
// screens/notifications.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 13: Notifications

const NotificationsScreen = ({ onNavigate }) => {
  const [filter, setFilter] = React.useState("all");
  const [unreadOnly, setUnreadOnly] = React.useState(false);

  const notifications = [
    // Today
    { day: "today", time: "14:32", priority: "warning", icon: "alert-triangle", title: "8 produits avec péremption proche", desc: "Doliprane 1g, Efferalgan, Aspégic… nécessitent une action sous 90 jours", unread: true },
    { day: "today", time: "13:08", priority: "danger", icon: "package", title: "Ventoline en rupture de stock", desc: "Dernière unité vendue il y a 12 minutes. Recommander auprès de GSK.", unread: true },
    { day: "today", time: "11:45", priority: "info", icon: "shopping-cart", title: "Vente #00425 encaissée — 12 400 Fdj", desc: "Halima Youssouf · 3 articles · Paiement Waafi", unread: true },
    { day: "today", time: "10:20", priority: "info", icon: "user-plus", title: "Nouveau client enregistré", desc: "Sahra Ali Bouh (Haramous) ajoutée par Idriss A.", unread: false },
    { day: "today", time: "09:15", priority: "warning", icon: "file-text", title: "Ordonnance avec interaction médicamenteuse", desc: "ORD-2026-0042 — Augmentin + allergie pénicilline détectée", unread: true },

    // Yesterday
    { day: "yesterday", time: "17:32", priority: "info", icon: "truck", title: "Livraison UBIPHAR réceptionnée", desc: "BC-2026-0123 · 12 articles · 1 245 000 Fdj", unread: false },
    { day: "yesterday", time: "14:00", priority: "danger", icon: "alert-circle", title: "3 produits en péremption urgente", desc: "Aspirine 500mg, Lasilix, Pédiatril — destruction à programmer", unread: false },
    { day: "yesterday", time: "10:30", priority: "info", icon: "users", title: "Halima Youssouf passe niveau Platine", desc: "1 580 points atteints — Notification SMS envoyée", unread: false },

    // This week
    { day: "week", time: "Lundi", priority: "info", icon: "bar-chart", title: "Rapport hebdomadaire disponible", desc: "CA 892 600 Fdj sur la semaine · +8.1% vs semaine précédente", unread: false },
    { day: "week", time: "Lundi", priority: "warning", icon: "shield", title: "CNSS Djibouti — Bordereau à envoyer", desc: "Échéance dans 5 jours · 1 840 000 Fdj de créances", unread: false },
    { day: "week", time: "Dimanche", priority: "info", icon: "save", title: "Sauvegarde automatique réussie", desc: "23/05 03:00 · Base de données 412 MB · OK", unread: false },
  ];

  const priorityInfo = {
    info: { bg: "var(--primary-50)", color: "var(--primary)", label: "INFO" },
    warning: { bg: "var(--warning-50)", color: "var(--warning)", label: "WARN" },
    danger: { bg: "var(--danger-50)", color: "var(--danger)", label: "URGENT" },
  };

  const dayLabels = { today: "Aujourd'hui", yesterday: "Hier", week: "Cette semaine" };

  let filtered = filter === "all" ? notifications : notifications.filter(n => n.priority === filter);
  if (unreadOnly) filtered = filtered.filter(n => n.unread);

  const grouped = filtered.reduce((acc, n) => {
    (acc[n.day] = acc[n.day] || []).push(n);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Notifications</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            <strong style={{ color: "var(--danger)" }}>7 non lues</strong> · 4 urgentes
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="check" size={14} /> Tout marquer lu</button>
          <button className="btn btn-secondary"><Icon name="settings" size={14} /> Préférences</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <div className="switch">
          <button className={`switch-opt ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Toutes</button>
          <button className={`switch-opt ${filter === "info" ? "active" : ""}`} onClick={() => setFilter("info")}>Info</button>
          <button className={`switch-opt ${filter === "warning" ? "active" : ""}`} onClick={() => setFilter("warning")}>Warning</button>
          <button className={`switch-opt ${filter === "danger" ? "active" : ""}`} onClick={() => setFilter("danger")}>Urgent</button>
        </div>
        <span className="spacer"></span>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", userSelect: "none" }}>
          Afficher uniquement non lues
          <button className={`toggle ${unreadOnly ? "on" : ""}`} onClick={() => setUnreadOnly(!unreadOnly)}></button>
        </label>
      </div>

      {/* Notification groups */}
      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--text-subtle)",
            margin: "0 0 8px 4px",
          }}>{dayLabels[day]} · {items.length} notification(s)</div>

          <div className="card card-flush" style={{ overflow: "hidden" }}>
            {items.map((n, i) => {
              const p = priorityInfo[n.priority];
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 16px",
                  borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                  background: n.unread ? "var(--primary-50)" : "transparent",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 150ms",
                }}>
                  {n.unread && (
                    <span style={{
                      position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)",
                      width: 6, height: 6, borderRadius: 999, background: "var(--primary)",
                    }}></span>
                  )}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: p.bg, color: p.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={n.icon} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{n.time}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{n.desc}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                        padding: "2px 6px", borderRadius: 4,
                        background: p.color, color: "white",
                      }}>{p.label}</span>
                      {n.unread && <button className="btn btn-ghost btn-sm" style={{ height: 22, padding: "0 6px", fontSize: 11 }}><Icon name="check" size={11} /> Marquer lu</button>}
                      <button className="btn btn-ghost btn-sm" style={{ height: 22, padding: "0 6px", fontSize: 11 }}><Icon name="archive" size={11} /> Archiver</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

window.NotificationsScreen = NotificationsScreen;


// ════════════════════════════════════════════════════════════════════
// screens/users.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 14: Users & permissions

const UsersScreen = ({ onNavigate }) => {
  const users = [
    { id: 1, name: "Dr. Amina Farah", email: "amina.farah@pharmacie-centrale.dj", role: "Pharmacien titulaire", roleColor: "#0EA5E9", status: "online", last: "En ligne" },
    { id: 2, name: "Idriss Abdallah", email: "idriss.abdallah@pharmacie-centrale.dj", role: "Caissier", roleColor: "#10B981", status: "online", last: "En ligne" },
    { id: 3, name: "Maryam Houssein", email: "maryam.houssein@pharmacie-centrale.dj", role: "Assistant pharmacie", roleColor: "#8B5CF6", status: "online", last: "Il y a 12 min" },
    { id: 4, name: "Said Mohamed", email: "said.mohamed@pharmacie-centrale.dj", role: "Assistant pharmacie", roleColor: "#8B5CF6", status: "offline", last: "Hier · 18:42" },
    { id: 5, name: "Hibo Ali", email: "hibo.ali@pharmacie-centrale.dj", role: "Caissier", roleColor: "#10B981", status: "offline", last: "Il y a 3 jours" },
    { id: 6, name: "Dr. Houssein Bouh", email: "houssein.bouh@pharmacie-centrale.dj", role: "Pharmacien adjoint", roleColor: "#0EA5E9", status: "offline", last: "Il y a 1 semaine" },
    { id: 7, name: "Ahmed Issa", email: "ahmed.issa@pharmacie-centrale.dj", role: "Administrateur", roleColor: "#EF4444", status: "offline", last: "Il y a 2 jours" },
  ];

  const audit = [
    { ts: "14:32", user: "Amina F.", action: "Modification prix", obj: "Doliprane 500mg (350 → 380 Fdj)", severity: "info" },
    { ts: "13:08", user: "Idriss A.", action: "Encaissement", obj: "Ticket #00425 (12 400 Fdj)", severity: "info" },
    { ts: "11:42", user: "Ahmed I.", action: "Suppression utilisateur", obj: "Compte test-user@dj", severity: "danger" },
    { ts: "10:15", user: "Maryam H.", action: "Création médicament", obj: "Nouveau : Levothyrox 100µg", severity: "info" },
    { ts: "09:22", user: "Amina F.", action: "Export données client", obj: "Liste de 1 247 clients (CSV)", severity: "warning" },
    { ts: "Hier 18:08", user: "Idriss A.", action: "Annulation vente", obj: "Ticket #00418 (raison: erreur saisie)", severity: "warning" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Utilisateurs</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Comptes, rôles et journal d'audit
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="shield" size={14} /> Rôles & permissions</button>
          <button className="btn btn-primary"><Icon name="user-plus" size={14} /> Inviter un utilisateur</button>
        </div>
      </div>

      {/* Users table */}
      <div className="card card-flush" style={{ marginBottom: 24 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <strong>7 utilisateurs actifs</strong>
          <span className="badge badge-success">3 en ligne</span>
          <span className="spacer"></span>
          <div className="input-group" style={{ width: 240 }}>
            <span className="input-icon"><Icon name="search" size={14} /></span>
            <input className="input" style={{ height: 32, fontSize: 13 }} placeholder="Rechercher…" />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <Avatar name={u.name} />
                      <span style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: 999,
                        background: u.status === "online" ? "var(--success)" : "var(--text-subtle)",
                        border: "2px solid var(--bg-elev)",
                      }}></span>
                    </div>
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{u.email}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                    background: u.roleColor + "20", color: u.roleColor,
                  }}>{u.role}</span>
                </td>
                <td>
                  <span className={`badge badge-${u.status === "online" ? "success" : "neutral"} badge-dot`}>
                    {u.status === "online" ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{u.last}</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="icon-btn" style={{ width: 28, height: 28 }} title="Modifier"><Icon name="edit" size={14} /></button>
                    <button className="icon-btn" style={{ width: 28, height: 28 }} title="Permissions"><Icon name="key" size={14} /></button>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more-horizontal" size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit log */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 className="t-h4" style={{ margin: 0 }}>
              <Icon name="history" size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
              Journal d'audit
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)" }}>Traçabilité des actions sensibles · 24 dernières heures</p>
          </div>
          <button className="btn btn-secondary btn-sm"><Icon name="download" size={13} /> Exporter logs</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {audit.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 0", borderBottom: i < audit.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 80, flexShrink: 0 }}>{a.ts}</div>
              <Avatar name={a.user} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>
                  <strong>{a.user}</strong> <span style={{ color: "var(--text-muted)" }}>—</span> {a.action}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{a.obj}</div>
              </div>
              <span className={`badge badge-${a.severity === "info" ? "neutral" : a.severity === "warning" ? "warning" : "danger"}`}>
                {a.severity === "info" ? "INFO" : a.severity === "warning" ? "ATTENTION" : "SENSIBLE"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.UsersScreen = UsersScreen;


// ════════════════════════════════════════════════════════════════════
// screens/settings.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 15: Settings

const SettingsScreen = ({ onNavigate }) => {
  const [section, setSection] = React.useState("pharmacy");

  const sections = [
    { id: "pharmacy", icon: "building", label: "Pharmacie" },
    { id: "currency", icon: "banknote", label: "Devise & TVA" },
    { id: "documents", icon: "file-text", label: "Modèles de documents" },
    { id: "categories", icon: "tag", label: "Catégories" },
    { id: "labs", icon: "truck", label: "Laboratoires" },
    { id: "printers", icon: "printer", label: "Imprimantes" },
    { id: "backups", icon: "database", label: "Sauvegardes" },
    { id: "i18n", icon: "globe", label: "Langue & thème" },
    { id: "logs", icon: "history", label: "Logs système" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Paramètres</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Configuration de votre pharmacie et de PHARMASOFT
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 8, position: "sticky", top: 80 }}>
          {sections.map(s => (
            <div key={s.id} onClick={() => setSection(s.id)}
              className={`nav-item ${section === s.id ? "active" : ""}`}
              style={{ fontSize: 13, padding: "8px 10px" }}>
              <Icon name={s.icon} size={15} className="nav-item-icon" />
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div>
          {section === "pharmacy" && (
            <div className="card">
              <h2 className="t-h3" style={{ marginTop: 0 }}>Informations de la pharmacie</h2>
              <p className="t-muted" style={{ marginTop: 0 }}>Ces informations apparaissent sur les tickets, factures et bordereaux.</p>
              <div className="grid grid-2">
                <div>
                  <label className="field-label">Raison sociale</label>
                  <input className="input" defaultValue={PHARMACY.name} />
                </div>
                <div>
                  <label className="field-label">NIF</label>
                  <input className="input" defaultValue={PHARMACY.nif} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Adresse</label>
                  <input className="input" defaultValue={`${PHARMACY.address}, ${PHARMACY.city}`} />
                </div>
                <div>
                  <label className="field-label">Téléphone</label>
                  <input className="input" defaultValue={PHARMACY.phone} />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input className="input" defaultValue="contact@pharmacie-centrale.dj" />
                </div>
                <div>
                  <label className="field-label">N° d'agrément ordre</label>
                  <input className="input" defaultValue="PH-DJ-2018-042" />
                </div>
                <div>
                  <label className="field-label">Pharmacien responsable</label>
                  <input className="input" defaultValue="Dr. Amina Farah" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary">Annuler</button>
                <button className="btn btn-primary"><Icon name="save" size={14} /> Enregistrer</button>
              </div>
            </div>
          )}

          {section === "currency" && (
            <div className="card">
              <h2 className="t-h3" style={{ marginTop: 0 }}>Devise & TVA</h2>
              <div className="grid grid-2">
                <div>
                  <label className="field-label">Devise</label>
                  <select className="input"><option>Franc Djiboutien (Fdj)</option></select>
                </div>
                <div>
                  <label className="field-label">Symbole</label>
                  <input className="input" defaultValue="Fdj" />
                </div>
                <div>
                  <label className="field-label">Position du symbole</label>
                  <select className="input">
                    <option>Après le montant — 1 500 Fdj</option>
                    <option>Avant le montant — Fdj 1 500</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Séparateur des milliers</label>
                  <select className="input"><option>Espace — 1 500</option><option>Virgule — 1,500</option><option>Point — 1.500</option></select>
                </div>
                <div>
                  <label className="field-label">TVA par défaut</label>
                  <input className="input" defaultValue="10%" />
                </div>
                <div>
                  <label className="field-label">Arrondi monétaire</label>
                  <select className="input"><option>5 Fdj</option><option>10 Fdj</option><option>Aucun</option></select>
                </div>
              </div>
            </div>
          )}

          {section === "backups" && (
            <div className="col">
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 className="t-h3" style={{ margin: 0 }}>Sauvegardes</h2>
                    <p className="t-muted" style={{ marginTop: 4 }}>Sauvegardes automatiques quotidiennes à 3h du matin</p>
                  </div>
                  <button className="btn btn-primary"><Icon name="database" size={14} /> Sauvegarder maintenant</button>
                </div>
                <div style={{
                  marginTop: 16, padding: 12,
                  background: "var(--success-50)", border: "1px solid var(--success)", borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <Icon name="check-circle" size={20} style={{ color: "var(--success)" }} />
                  <div>
                    <strong>Dernière sauvegarde : aujourd'hui 03:00</strong>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>412 MB · Cloud Djibouti + clé USB locale</div>
                  </div>
                </div>
              </div>

              <div className="card card-flush">
                <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                  <strong>Historique des sauvegardes</strong>
                </div>
                <table className="table">
                  <thead><tr><th>Date</th><th>Taille</th><th>Destination</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {[
                      { d: "27/05/2026 03:00", s: "412 MB", dest: "Cloud + USB", st: "ok" },
                      { d: "26/05/2026 03:00", s: "410 MB", dest: "Cloud + USB", st: "ok" },
                      { d: "25/05/2026 03:00", s: "408 MB", dest: "Cloud", st: "warning" },
                      { d: "24/05/2026 03:00", s: "405 MB", dest: "Cloud + USB", st: "ok" },
                      { d: "23/05/2026 03:00", s: "402 MB", dest: "Cloud + USB", st: "ok" },
                    ].map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{b.d}</td>
                        <td>{b.s}</td>
                        <td>{b.dest}</td>
                        <td>
                          {b.st === "ok"
                            ? <span className="badge badge-success badge-dot">Réussie</span>
                            : <span className="badge badge-warning badge-dot">Partielle</span>}
                        </td>
                        <td>
                          <div className="row" style={{ gap: 4 }}>
                            <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Télécharger</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}><Icon name="refresh" size={13} /> Restaurer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "categories" && (
            <div className="card">
              <h2 className="t-h3" style={{ marginTop: 0 }}>Catégories de produits</h2>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <div key={c.id} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: c.color + "20", color: c.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Icon name={c.icon} size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{Math.floor(Math.random()*60)+12} produits</div>
                    </div>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more-horizontal" size={14} /></button>
                  </div>
                ))}
                <div style={{
                  border: "2px dashed var(--border-strong)", borderRadius: 12, padding: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  color: "var(--text-muted)", fontWeight: 500, cursor: "pointer",
                }}>
                  <Icon name="plus" size={16} /> Ajouter catégorie
                </div>
              </div>
            </div>
          )}

          {section !== "pharmacy" && section !== "currency" && section !== "backups" && section !== "categories" && (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <Icon name="wrench" size={36} style={{ color: "var(--text-subtle)" }} />
              <h3 style={{ marginTop: 12, marginBottom: 4 }}>Section {sections.find(s => s.id === section)?.label}</h3>
              <p className="t-muted" style={{ marginTop: 0 }}>Formulaire de configuration correspondant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.SettingsScreen = SettingsScreen;


// ════════════════════════════════════════════════════════════════════
// screens/caisse.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 16: Cashier session (open / running / close)

const CaisseScreen = ({ onNavigate }) => {
  const [phase, setPhase] = React.useState("running"); // open | running | close

  if (phase === "open") {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setPhase("running")} style={{ marginBottom: 12 }}>
          <Icon name="chevron-left" size={14} /> Annuler
        </button>
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 999, margin: "0 auto 16px",
            background: "var(--primary-50)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><Icon name="log-in" size={40} /></div>
          <h2 className="t-h2" style={{ margin: 0 }}>Ouverture de caisse</h2>
          <p className="t-muted" style={{ marginTop: 6 }}>Saisissez le fond de caisse initial pour démarrer une nouvelle session.</p>

          <div style={{ marginTop: 24, textAlign: "left" }}>
            <label className="field-label">Caissier</label>
            <div className="card" style={{ padding: 10, background: "var(--bg-sunken)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name="Idriss Abdallah" size="sm" />
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>Idriss Abdallah</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Caissier · ID 002</div></div>
            </div>

            <label className="field-label">Fond de caisse initial (Fdj)</label>
            <input className="input input-lg" style={{ fontSize: 24, height: 60, textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700 }} defaultValue="20 000" />

            <div className="grid grid-3" style={{ marginTop: 12, gap: 8 }}>
              {[10000, 20000, 30000].map(v => (
                <button key={v} className="btn btn-secondary">{fmtMoney(v, false)} Fdj</button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-xl" style={{ width: "100%", marginTop: 24 }} onClick={() => setPhase("running")}>
            <Icon name="check" size={20} /> Ouvrir la caisse
          </button>
        </div>
      </div>
    );
  }

  if (phase === "close") {
    const denominations = [
      { v: 10000, q: 8 }, { v: 5000, q: 12 }, { v: 2000, q: 24 },
      { v: 1000, q: 38 }, { v: 500, q: 14 }, { v: 100, q: 42 },
      { v: 50, q: 18 }, { v: 20, q: 30 }, { v: 10, q: 24 }, { v: 5, q: 18 },
    ];
    const counted = denominations.reduce((s, d) => s + d.v * d.q, 0);
    const theoretical = 178540;
    const diff = counted - theoretical;

    return (
      <div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPhase("running")} style={{ marginBottom: 12 }}>
          <Icon name="chevron-left" size={14} /> Retour
        </button>

        <div className="page-header">
          <div>
            <h1 className="t-h2" style={{ margin: 0 }}>Clôture de caisse</h1>
            <p className="t-muted" style={{ marginTop: 4, marginBottom: 0 }}>Session ouverte par Idriss A. depuis 07:32 — durée 7h 12min</p>
          </div>
          <div className="row">
            <button className="btn btn-secondary"><Icon name="printer" size={14} /> Rapport Z</button>
            <button className="btn btn-danger"><Icon name="lock" size={14} /> Clôturer la caisse</button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* Counting */}
          <div className="card">
            <h3 className="t-h4" style={{ marginTop: 0 }}>Comptage des espèces</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {denominations.map(d => (
                <div key={d.v} style={{
                  display: "grid", gridTemplateColumns: "70px 1fr 70px 100px", alignItems: "center", gap: 8,
                  padding: "6px 8px", borderRadius: 6, background: "var(--bg-sunken)",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--primary)" }}>
                    {d.v >= 1000 ? fmtMoney(d.v, false) : d.v} F
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>×</div>
                  <input className="input" style={{ height: 28, fontSize: 13, padding: "0 6px", textAlign: "center" }} defaultValue={d.q} />
                  <div style={{ fontSize: 13, textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    {fmtMoney(d.v * d.q)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="col">
            <div className="card">
              <h3 className="t-h4" style={{ marginTop: 0, marginBottom: 16 }}>Synthèse session</h3>
              {[
                ["Fond initial", "20 000 Fdj"],
                ["Encaissements espèces", "164 200 Fdj"],
                ["Encaissements carte", "42 800 Fdj"],
                ["Encaissements D-Money", "18 400 Fdj"],
                ["Encaissements Waafi", "12 600 Fdj"],
                ["Sorties espèces", "−5 660 Fdj"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span className="t-muted">{k}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div className="divider" style={{ margin: "8px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 600 }}>
                <span>Théorique espèces</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(theoretical)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 600 }}>
                <span>Compté</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{fmtMoney(counted)}</span>
              </div>
              <div className="divider" style={{ margin: "8px 0" }}></div>
              <div style={{
                padding: 14, borderRadius: 8, marginTop: 4,
                background: diff === 0 ? "var(--success-50)" : Math.abs(diff) < 500 ? "var(--warning-50)" : "var(--danger-50)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>ÉCART</strong>
                  <span style={{
                    fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)",
                    color: diff === 0 ? "var(--success)" : Math.abs(diff) < 500 ? "var(--warning)" : "var(--danger)",
                  }}>
                    {diff > 0 ? "+" : ""}{fmtMoney(diff)}
                  </span>
                </div>
                {diff !== 0 && (
                  <textarea className="input" style={{ marginTop: 10, height: 60, resize: "vertical", padding: 10 }} placeholder="Motif de l'écart (obligatoire si > 500 Fdj)…"></textarea>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Running session
  const sessionSales = [
    { time: "14:32", ticket: "#00425", method: "Waafi", amount: 12400 },
    { time: "13:42", ticket: "#00424", method: "Espèces", amount: 8600 },
    { time: "13:15", ticket: "#00423", method: "Carte", amount: 22400 },
    { time: "12:48", ticket: "#00422", method: "CNSS", amount: 6800 },
    { time: "12:20", ticket: "#00421", method: "D-Money", amount: 4200 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Caisse en cours</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Session #C-2026-0142 · Ouverte à 07:32 par Idriss A. · Caisse principale
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={() => setPhase("open")}><Icon name="log-in" size={14} /> Nouvelle ouverture</button>
          <button className="btn btn-danger" onClick={() => setPhase("close")}><Icon name="lock" size={14} /> Clôturer la caisse</button>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%)", color: "white", border: 0 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Montant théorique</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)" }}>178 540 Fdj</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>en caisse</div>
        </div>
        <div className="card">
          <div className="t-muted t-small">Transactions</div>
          <div className="kpi-value">42</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>ticket moyen 4 250 Fdj</div>
        </div>
        <div className="card">
          <div className="t-muted t-small">Durée session</div>
          <div className="kpi-value">7h 12min</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>depuis 07:32</div>
        </div>
        <div className="card">
          <div className="t-muted t-small">Caissier actif</div>
          <div className="row" style={{ marginTop: 6, gap: 10 }}>
            <Avatar name="Idriss Abdallah" />
            <div><strong>Idriss A.</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Caisse principale</div></div>
          </div>
        </div>
      </div>

      {/* Methods breakdown */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", marginBottom: 24 }}>
        <div className="card">
          <h3 className="t-h4" style={{ marginTop: 0 }}>Répartition des paiements</h3>
          <HBarChart data={[
            { label: "Espèces", value: 164200, color: "#10B981" },
            { label: "Carte bancaire", value: 42800, color: "#0EA5E9" },
            { label: "D-Money", value: 18400, color: "#F59E0B" },
            { label: "Waafi", value: 12600, color: "#8B5CF6" },
            { label: "CNSS / Assur.", value: 8400, color: "#EC4899" },
          ]} formatValue={v => fmtMoney(v)} />
        </div>
        <div className="card card-flush">
          <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
            <strong>Dernières transactions</strong>
          </div>
          <table className="table">
            <thead><tr><th>Heure</th><th>Ticket</th><th>Mode</th><th style={{ textAlign: "right" }}>Montant</th></tr></thead>
            <tbody>
              {sessionSales.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{s.time}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s.ticket}</td>
                  <td><span className="badge badge-neutral">{s.method}</span></td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtMoney(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

window.CaisseScreen = CaisseScreen;


// ════════════════════════════════════════════════════════════════════
// screens/ticket-preview.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 17: Receipt preview (80mm thermal printer)

const TicketPreviewScreen = ({ onNavigate }) => {
  const items = [
    { name: "Doliprane 500mg", qty: 2, price: 350 },
    { name: "Amoxicilline 500mg", qty: 1, price: 1450 },
    { name: "Smecta 3g", qty: 3, price: 720 },
    { name: "Vitamine C 1g", qty: 1, price: 420 },
  ];
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tva = subtotal * 0.10;
  const total = subtotal + tva;
  const paid = 8000;
  const change = paid - total;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h2" style={{ margin: 0 }}>Aperçu — Ticket de caisse</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Format imprimante thermique 80mm — Ticket #00425
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="mail" size={14} /> Envoyer par SMS</button>
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Télécharger PDF</button>
          <button className="btn btn-primary"><Icon name="printer" size={14} /> Imprimer</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 360px", gap: 16 }}>
        {/* Receipt preview */}
        <div className="receipt-stage">
          <div className="ticket">
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, margin: "0 auto 6px",
                background: "linear-gradient(135deg, #0EA5E9, #10B981)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="pill" size={20} style={{ color: "white" }} />
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13 }}>{PHARMACY.name}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{PHARMACY.address}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{PHARMACY.city} · Tél : {PHARMACY.phone}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>NIF : {PHARMACY.nif}</div>
            </div>

            <div className="ticket-divider"></div>

            {/* Meta */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Ticket :</span>
              <strong>#00425</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Date :</span>
              <span>27/05/2026 14:32</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Caissier :</span>
              <span>Idriss A.</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Client :</span>
              <span>Halima Y. (Or)</span>
            </div>

            <div className="ticket-divider"></div>

            {/* Items */}
            <div style={{ fontSize: 11 }}>
              {items.map(i => (
                <div key={i.name} style={{ marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{i.name}</span>
                    <span>{fmtMoney(i.qty * i.price, false)}</span>
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: 10 }}>
                    {i.qty} × {fmtMoney(i.price, false)}
                  </div>
                </div>
              ))}
            </div>

            <div className="ticket-divider"></div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Sous-total HT</span>
              <span>{fmtMoney(subtotal - tva, false)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>TVA 10%</span>
              <span>{fmtMoney(tva, false)}</span>
            </div>

            <div className="ticket-divider"></div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <strong style={{ fontSize: 14 }}>TOTAL</strong>
              <strong style={{ fontSize: 18 }}>{fmtMoney(total, false)} Fdj</strong>
            </div>

            <div className="ticket-divider"></div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Espèces</span><span>{fmtMoney(paid, false)} Fdj</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Monnaie rendue</span><span>{fmtMoney(change, false)} Fdj</span>
            </div>

            <div className="ticket-divider"></div>

            {/* Loyalty */}
            <div style={{ padding: "6px 0", textAlign: "center", fontSize: 11, color: "#0EA5E9" }}>
              <Icon name="award" size={11} style={{ verticalAlign: "-2px", marginRight: 3 }} />
              +{Math.round(total / 100)} points fidélité · Solde : 856 pts
            </div>

            <div className="ticket-divider"></div>

            {/* Legal */}
            <div style={{ fontSize: 9, textAlign: "center", color: "#64748B", lineHeight: 1.5, marginTop: 6 }}>
              Les médicaments sont des produits qui ne sont pas comme les autres. Demandez conseil à votre pharmacien.<br/>
              Cachet PHARMASOFT · v3.4.2 · Réf TVA : DJ-12345A
            </div>

            {/* QR + thanks */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 12, marginBottom: 8 }}>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ background: "white" }}>
                {/* Fake QR pattern */}
                {Array.from({ length: 100 }).map((_, i) => {
                  const x = (i % 10) * 8;
                  const y = Math.floor(i / 10) * 8;
                  const filled = ((i * 7 + 11) % 3) !== 0 && ((i * 13 + 7) % 5) !== 0;
                  return filled ? <rect key={i} x={x} y={y} width="8" height="8" fill="#0F172A"/> : null;
                })}
                {/* Corner markers */}
                {[[0, 0], [56, 0], [0, 56]].map(([x, y]) => (
                  <g key={`${x}-${y}`}>
                    <rect x={x} y={y} width="24" height="24" fill="white"/>
                    <rect x={x} y={y} width="24" height="24" fill="none" stroke="#0F172A" strokeWidth="3"/>
                    <rect x={x + 8} y={y + 8} width="8" height="8" fill="#0F172A"/>
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-sans)" }}>
              MERCI DE VOTRE VISITE !
            </div>
            <div style={{ textAlign: "center", fontSize: 10, color: "#64748B", marginTop: 4 }}>
              Bonne santé à vous · pharmacie-centrale.dj
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="col">
          <div className="card">
            <h3 className="t-h4" style={{ marginTop: 0 }}>Options d'impression</h3>
            <div className="col" style={{ gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                Inclure le détail TVA <button className="toggle on"></button>
              </label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                Imprimer le QR code <button className="toggle on"></button>
              </label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                Mention points fidélité <button className="toggle on"></button>
              </label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                Format A4 (au lieu de 80mm) <button className="toggle"></button>
              </label>
            </div>
          </div>

          <div className="card">
            <h3 className="t-h4" style={{ marginTop: 0 }}>Imprimante</h3>
            <select className="input"><option>EPSON TM-T20III — Caisse principale</option></select>
            <div style={{ fontSize: 12, color: "var(--success)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="dot" style={{ background: "var(--success)" }}></span>
              Connectée · Papier OK · 80mm
            </div>
          </div>

          <div className="card" style={{ background: "var(--primary-50)", borderColor: "var(--primary)" }}>
            <h3 className="t-h4" style={{ marginTop: 0 }}><Icon name="send" size={16} style={{ verticalAlign: "-3px" }} /> Envoyer par SMS</h3>
            <p style={{ fontSize: 13, margin: "0 0 12px" }}>Halima Youssouf · +253 77 78 90 12</p>
            <button className="btn btn-primary" style={{ width: "100%" }}><Icon name="smartphone" size={14} /> Envoyer le ticket</button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.TicketPreviewScreen = TicketPreviewScreen;


// ════════════════════════════════════════════════════════════════════
// screens/rtl-demo.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 18: Arabic RTL demo
// Renders a mini dashboard with RTL direction and Arabic copy as a demonstration.

const RtlDemoScreen = ({ onNavigate }) => {
  const t = T.ar;

  return (
    <div dir="rtl" style={{ direction: "rtl" }}>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>{t.dashboard}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            الأربعاء 27 مايو 2026 — نظرة عامة على صيدليتك
          </p>
        </div>
        <div className="row">
          <div className="switch">
            <button className="switch-opt">7 أيام</button>
            <button className="switch-opt active">30 يوماً</button>
            <button className="switch-opt">90 يوماً</button>
          </div>
          <button className="btn btn-secondary"><Icon name="download" size={14} /> تصدير</button>
        </div>
      </div>

      {/* Banner */}
      <div className="card" style={{ background: "var(--primary-50)", borderColor: "var(--primary)", padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--primary)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}><Icon name="globe" size={20} /></div>
        <div>
          <strong>وضع العرض باللغة العربية (RTL)</strong>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            يعمل التصميم بالكامل في الاتجاهين — الشريط الجانبي على اليمين والمحتوى معكوس. التبديل من القائمة العلوية.
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: t.today_revenue, value: "152 400 Fdj", delta: "+12.4%", up: true, icon: "banknote", c: "#0EA5E9" },
          { label: t.week_revenue, value: "892 600 Fdj", delta: "+8.1%", up: true, icon: "trending-up", c: "#10B981" },
          { label: t.month_revenue, value: "3 245 800 Fdj", delta: "+18.6%", up: true, icon: "bar-chart", c: "#8B5CF6" },
          { label: t.avg_basket, value: "4 250 Fdj", delta: "−2.3%", up: false, icon: "shopping-cart", c: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="kpi-label">{s.label}</div>
                <div className="kpi-value">{s.value}</div>
                <div className={`kpi-delta ${s.up ? "up" : "down"}`}>
                  <Icon name={s.up ? "trending-up" : "trending-down"} size={12} />
                  <span>{s.delta}</span>
                </div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: s.c + "20", color: s.c,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Icon name={s.icon} size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Top meds */}
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="card">
          <h3 className="t-h4" style={{ margin: "0 0 16px" }}>أفضل 5 أدوية اليوم</h3>
          {[
            { ar: "دوليبران ٥٠٠ ملغ", fr: "Doliprane 500mg", qty: 84, revenue: 29400 },
            { ar: "أموكسيسيلين ٥٠٠ ملغ", fr: "Amoxicilline 500mg", qty: 42, revenue: 60900 },
            { ar: "سباسفون", fr: "Spasfon", qty: 38, revenue: 18240 },
            { ar: "فيتامين سي ١غ", fr: "Vitamine C 1g", qty: 32, revenue: 13440 },
            { ar: "أوغمنتين ١غ", fr: "Augmentin 1g", qty: 18, revenue: 52020 },
          ].map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: "1px solid var(--border)",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: i === 0 ? "var(--primary)" : "var(--bg-sunken)",
                color: i === 0 ? "white" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: 12,
              }}>{i + 1}</div>
              <MedImage name={m.fr} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{m.ar}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.qty} وحدة مباعة</div>
              </div>
              <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{fmtMoney(m.revenue)}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="t-h4" style={{ margin: "0 0 12px" }}>التنبيهات النشطة</h3>
          <div className="grid grid-2" style={{ gap: 10 }}>
            {[
              { count: 3, label: "نفاد قريب جداً", icon: "alert-circle", color: "danger" },
              { count: 8, label: "تنتهي صلاحيته", icon: "alert-triangle", color: "warning" },
              { count: 12, label: "مخزون منخفض", icon: "package", color: "danger" },
              { count: 4, label: "نفد المخزون", icon: "x", color: "neutral" },
            ].map((a, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 10,
                background: `var(--${a.color}-50)`,
              }}>
                <Icon name={a.icon} size={18} style={{ color: `var(--${a.color})` }}/>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{a.count}</div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.RtlDemoScreen = RtlDemoScreen;


// ════════════════════════════════════════════════════════════════════
// screens/dark-demo.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 19: Dark mode demo
// Forces a dark wrapper independent of global theme so the user always sees the dark palette here.

const DarkDemoScreen = ({ onNavigate }) => {
  return (
    <div style={{
      // Force dark palette inline regardless of global theme
      "--bg": "#0F172A",
      "--bg-elev": "#1E293B",
      "--bg-sunken": "#020617",
      "--border": "#334155",
      "--border-strong": "#475569",
      "--text": "#F8FAFC",
      "--text-muted": "#94A3B8",
      "--text-subtle": "#64748B",
      "--primary-50": "rgba(14, 165, 233, 0.12)",
      "--danger-50": "rgba(239, 68, 68, 0.15)",
      "--warning-50": "rgba(245, 158, 11, 0.15)",
      "--success-50": "rgba(34, 197, 94, 0.15)",
      "--sidebar-active-text": "#38BDF8",
      background: "#0F172A", color: "#F8FAFC",
      margin: -32, padding: 32, minHeight: "calc(100vh - 64px)",
    }}>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>Mode sombre · Démonstration</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Palette sombre cohérente — bascule globale disponible dans la barre supérieure
          </p>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icon name="sun" size={14} /> Aperçu clair</button>
          <button className="btn btn-primary"><Icon name="moon" size={14} /> Mode sombre activé</button>
        </div>
      </div>

      {/* Banner */}
      <div className="card" style={{ background: "var(--primary-50)", borderColor: "var(--primary)", padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--primary)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}><Icon name="moon" size={20} /></div>
        <div>
          <strong style={{ color: "var(--text)" }}>Confort visuel en environnement de pharmacie</strong>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Le mode sombre est idéal pour les longues sessions de travail, garde de nuit et impression sur écran fatigant.
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "CA du jour", value: "152 400 Fdj", delta: "+12.4%", icon: "banknote", c: "#0EA5E9" },
          { label: "CA semaine", value: "892 600 Fdj", delta: "+8.1%", icon: "trending-up", c: "#10B981" },
          { label: "CA mois", value: "3 245 800 Fdj", delta: "+18.6%", icon: "bar-chart", c: "#8B5CF6" },
          { label: "Panier moyen", value: "4 250 Fdj", delta: "−2.3%", icon: "shopping-cart", c: "#F59E0B", down: true },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="kpi-label">{s.label}</div>
                <div className="kpi-value">{s.value}</div>
                <div className={`kpi-delta ${s.down ? "down" : "up"}`}>
                  <Icon name={s.down ? "trending-down" : "trending-up"} size={12} />
                  <span>{s.delta}</span>
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.c + "33", color: s.c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", marginBottom: 24 }}>
        <div className="card">
          <h3 className="t-h4" style={{ margin: 0, marginBottom: 8 }}>Ventes — 7 derniers jours</h3>
          <p className="t-small t-muted" style={{ margin: "0 0 16px" }}>Mode sombre · contrastes WCAG AA</p>
          <BarChart data={[
            { label: "Jeu", value: 142000 }, { label: "Ven", value: 178000 },
            { label: "Sam", value: 96000 }, { label: "Dim", value: 88000 },
            { label: "Lun", value: 165000 }, { label: "Mar", value: 189000 },
            { label: "Mer", value: 152400, highlight: true },
          ]} width={680} height={260} formatValue={v => v >= 1000 ? `${Math.round(v/1000)}k` : v}/>
        </div>
        <div className="card">
          <h3 className="t-h4" style={{ margin: 0, marginBottom: 16 }}>Mix par catégorie</h3>
          <DonutChart data={[
            { label: "Antalgiques", value: 28, color: "#EF4444" },
            { label: "Antibiotiques", value: 22, color: "#0EA5E9" },
            { label: "Digestif", value: 16, color: "#10B981" },
            { label: "Cardio", value: 14, color: "#EC4899" },
            { label: "Vitamines", value: 12, color: "#F59E0B" },
            { label: "Autres", value: 8, color: "#94A3B8" },
          ]} size={170} thickness={26} centerLabel="catégories" centerValue="6"/>
        </div>
      </div>

      {/* Palette showcase */}
      <div className="card">
        <h3 className="t-h4" style={{ marginTop: 0 }}>Palette sombre — tokens</h3>
        <div className="grid grid-4">
          {[
            { name: "BG", val: "#0F172A" }, { name: "BG-elev", val: "#1E293B" },
            { name: "BG-sunken", val: "#020617" }, { name: "Border", val: "#334155" },
            { name: "Border-strong", val: "#475569" }, { name: "Text", val: "#F8FAFC" },
            { name: "Text-muted", val: "#94A3B8" }, { name: "Text-subtle", val: "#64748B" },
          ].map(c => (
            <div key={c.name} style={{
              padding: 12, borderRadius: 8, border: "1px solid var(--border)",
              background: c.val,
              color: ["#F8FAFC", "#94A3B8"].includes(c.val) ? "#0F172A" : "#F8FAFC",
            }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.85 }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.DarkDemoScreen = DarkDemoScreen;


// ════════════════════════════════════════════════════════════════════
// screens/states.jsx
// ════════════════════════════════════════════════════════════════════

// PHARMASOFT — Screen 20: Special states (404 / error / empty)

const StateCard = ({ children, label, color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{
      fontSize: 11, fontWeight: 600, color, letterSpacing: "0.06em",
      textTransform: "uppercase", padding: "2px 0",
    }}>{label}</div>
    <div className="card" style={{
      minHeight: 460, padding: 0, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {children}
    </div>
  </div>
);

const StatesScreen = ({ onNavigate }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>États spéciaux</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            Pages d'erreur 404, erreur serveur et états vides — vocabulaire visuel cohérent
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        {/* 404 */}
        <StateCard label="404 — Non trouvée" color="#0EA5E9">
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              <div style={{
                fontSize: 96, fontWeight: 800, color: "var(--primary)",
                fontFamily: "var(--font-mono)", lineHeight: 1, letterSpacing: "-0.04em",
              }}>404</div>
              <div style={{
                position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
                width: 32, height: 32, borderRadius: 10,
                background: "var(--primary)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-md)",
              }}>
                <Icon name="search" size={18} />
              </div>
            </div>
            <h3 className="t-h3" style={{ margin: "8px 0" }}>Page introuvable</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 20px", fontSize: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              L'URL que vous avez suivie n'existe plus ou vous n'y avez pas accès.
            </p>
            <div className="row" style={{ justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => onNavigate("dashboard")}>
                <Icon name="chevron-left" size={14} /> Retour
              </button>
              <button className="btn btn-primary" onClick={() => onNavigate("dashboard")}>
                <Icon name="layout-dashboard" size={14} /> Tableau de bord
              </button>
            </div>
          </div>
        </StateCard>

        {/* Error 500 */}
        <StateCard label="500 — Erreur serveur" color="#EF4444">
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: "var(--danger-50)", color: "var(--danger)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", position: "relative",
            }}>
              <Icon name="alert-triangle" size={48} />
              <div style={{
                position: "absolute", inset: -6, borderRadius: 28,
                border: "2px dashed var(--danger)", opacity: 0.3,
              }}></div>
            </div>
            <h3 className="t-h3" style={{ margin: "8px 0" }}>Oups, un imprévu</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              Le serveur a rencontré une erreur. Vos données sont en sécurité — réessayez dans un instant.
            </p>
            <div style={{
              fontSize: 11, fontFamily: "var(--font-mono)", padding: "4px 10px",
              background: "var(--bg-sunken)", borderRadius: 4, display: "inline-block",
              color: "var(--text-muted)", marginBottom: 16,
            }}>ERR_PRESCRIPTION_FETCH_TIMEOUT · 27/05 14:32</div>
            <div className="row" style={{ justifyContent: "center" }}>
              <button className="btn btn-secondary">
                <Icon name="send" size={14} /> Signaler
              </button>
              <button className="btn btn-primary">
                <Icon name="refresh" size={14} /> Réessayer
              </button>
            </div>
          </div>
        </StateCard>

        {/* Empty state */}
        <StateCard label="Empty state" color="#10B981">
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{
              width: 96, height: 96, position: "relative", margin: "0 auto 20px",
            }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: 24,
                background: "var(--bg-sunken)", border: "2px dashed var(--border-strong)",
              }}></div>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-subtle)",
              }}>
                <Icon name="package" size={42} />
              </div>
            </div>
            <h3 className="t-h3" style={{ margin: "8px 0" }}>Aucune commande</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 20px", fontSize: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              Vous n'avez pas encore passé de commande fournisseur ce mois-ci. Créez-en une pour reconstituer votre stock.
            </p>
            <button className="btn btn-primary"><Icon name="plus" size={14} /> Nouvelle commande</button>
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <a href="#" style={{ color: "var(--primary)", textDecoration: "none" }}>Voir le tutoriel →</a>
            </div>
          </div>
        </StateCard>

        {/* Bonus — No connection */}
        <StateCard label="Mode hors-ligne" color="#F59E0B">
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: "var(--warning-50)", color: "var(--warning)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Icon name="wifi" size={48} strokeWidth={1.8} />
            </div>
            <h3 className="t-h3" style={{ margin: "8px 0" }}>Pas de connexion</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              Vous travaillez en local. Les ventes sont enregistrées et seront synchronisées dès le retour.
            </p>
            <span className="badge badge-warning badge-dot" style={{ marginBottom: 16 }}>3 ventes en attente de sync</span>
            <div className="row" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary">
                <Icon name="refresh" size={14} /> Tester la connexion
              </button>
            </div>
          </div>
        </StateCard>

        {/* No results */}
        <StateCard label="Aucun résultat" color="#8B5CF6">
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Icon name="search" size={42} />
            </div>
            <h3 className="t-h3" style={{ margin: "8px 0" }}>Aucun résultat</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              Nous n'avons trouvé aucun produit pour <strong style={{ color: "var(--text)" }}>« paracètamol 500 »</strong>.
              Vérifiez l'orthographe ou élargissez vos critères.
            </p>
            <div className="row" style={{ justifyContent: "center", gap: 6 }}>
              <span className="chip">Paracétamol 500</span>
              <span className="chip">Doliprane</span>
              <span className="chip">Antalgique</span>
            </div>
          </div>
        </StateCard>

        {/* Permission denied */}
        <StateCard label="Accès refusé" color="#EC4899">
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: "rgba(236, 72, 153, 0.12)", color: "#EC4899",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Icon name="lock" size={42} />
            </div>
            <h3 className="t-h3" style={{ margin: "8px 0" }}>Accès non autorisé</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              Votre rôle (<strong style={{ color: "var(--text)" }}>Caissier</strong>) ne permet pas l'accès aux rapports financiers.
              Demandez l'autorisation au pharmacien titulaire.
            </p>
            <div className="row" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary"><Icon name="key" size={14} /> Demander l'accès</button>
            </div>
          </div>
        </StateCard>
      </div>
    </div>
  );
};

window.StatesScreen = StatesScreen;

