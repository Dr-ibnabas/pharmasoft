// PHARMASOFT — Shared layout: Sidebar, Topbar, AppShell

const useAppCtx = () => React.useContext(AppCtx);
const AppCtx = React.createContext(null);

const Sidebar = ({ activeScreen, onNavigate, lang, theme, role = "admin" }) => {
  const t = T[lang];
  const rtl = lang === "ar";
  const user = ROLES[role].user;
  const canSee = (item) => !item.roles || item.roles.includes(role);
  const filteredNav = NAV.filter(canSee);
  // Group nav items by section
  const general = filteredNav.filter(i => ["dashboard", "pos", "medicines", "stock"].includes(i.key));
  const clientSales = filteredNav.filter(i => ["clients", "prescriptions", "suppliers"].includes(i.key));
  const admin = filteredNav.filter(i => ["reports", "insurance", "notifications", "users", "settings"].includes(i.key));
  const modulesItems = EXTRA_NAV.modules.filter(canSee);
  const demosItems = EXTRA_NAV.demos.filter(canSee);
  return (
    <aside className="sidebar" dir={rtl ? "rtl" : "ltr"}>
      <div className="sidebar-logo">
        <div className="row" style={{ gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(14,165,233,0.25)",
          }}>
            <Icon name="pill" size={20} style={{ color: "white" }} strokeWidth={2.4} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>PHARMASOFT</div>
            <div style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Djibouti</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "8px 10px", background: "var(--bg-sunken)", borderRadius: 8, fontSize: 12 }}>
          <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{PHARMACY.name}</div>
          <div className="t-subtle" style={{ fontSize: 11 }}>NIF · {PHARMACY.nif}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {general.length > 0 && (
          <>
            <div className="nav-section-label">{rtl ? "العامة" : "Général"}</div>
            {general.map(item => (
              <div key={item.key}
                className={`nav-item ${activeScreen === item.screen ? "active" : ""}`}
                onClick={() => onNavigate(item.screen)}>
                <Icon name={item.icon} size={18} className="nav-item-icon" />
                <span>{t[item.key]}</span>
                {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
              </div>
            ))}
          </>
        )}
        {clientSales.length > 0 && (
          <>
            <div className="nav-section-label">{rtl ? "العملاء" : "Clients & Ventes"}</div>
            {clientSales.map(item => (
              <div key={item.key}
                className={`nav-item ${activeScreen === item.screen ? "active" : ""}`}
                onClick={() => onNavigate(item.screen)}>
                <Icon name={item.icon} size={18} className="nav-item-icon" />
                <span>{t[item.key]}</span>
                {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
              </div>
            ))}
          </>
        )}
        {admin.length > 0 && (
          <>
            <div className="nav-section-label">{rtl ? "الإدارة" : "Administration"}</div>
            {admin.map(item => (
              <div key={item.key}
                className={`nav-item ${activeScreen === item.screen ? "active" : ""}`}
                onClick={() => onNavigate(item.screen)}>
                <Icon name={item.icon} size={18} className="nav-item-icon" />
                <span>{t[item.key]}</span>
                {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
              </div>
            ))}
          </>
        )}

        {modulesItems.length > 0 && (
          <>
            <div className="nav-section-label">{rtl ? "وحدات" : "Modules complémentaires"}</div>
            {modulesItems.map(item => (
              <div key={item.key}
                className={`nav-item ${activeScreen === item.key ? "active" : ""}`}
                onClick={() => onNavigate(item.key)}>
                <Icon name={item.icon} size={18} className="nav-item-icon" />
                <span>{item.label}</span>
              </div>
            ))}
          </>
        )}

        {demosItems.length > 0 && (
          <>
            <div className="nav-section-label">{rtl ? "العروض التوضيحية" : "Démonstrations"}</div>
            {demosItems.map(item => (
              <div key={item.key}
                className={`nav-item ${activeScreen === item.key ? "active" : ""}`}
                onClick={() => onNavigate(item.key)}>
                <Icon name={item.icon} size={18} className="nav-item-icon" />
                <span>{item.label}</span>
              </div>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <Avatar name={user.name} color={user.avatarColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }} className="truncate">{user.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }} className="truncate">{user.role}</div>
        </div>
        <button className="icon-btn" style={{ width: 32, height: 32 }} title="Déconnexion" onClick={() => onNavigate("login")}>
          <Icon name="log-out" size={16} />
        </button>
      </div>
    </aside>
  );
};

const Topbar = ({ breadcrumbs = [], lang, setLang, theme, setTheme, onNavigate, role = "admin", setRole }) => {
  const t = T[lang];
  const rtl = lang === "ar";
  const user = ROLES[role].user;
  const [langOpen, setLangOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);
  return (
    <header className="topbar">
      <div className="breadcrumb">
        {breadcrumbs.map((bc, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-sep"><Icon name="chevron-right" size={14} /></span>}
            <span className={i === breadcrumbs.length - 1 ? "breadcrumb-current" : ""}>{bc}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="topbar-search">
        <div className="input-group">
          <span className="input-icon"><Icon name="search" size={16} /></span>
          <input className="input" placeholder={t.search_global} />
          <span style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 11, color: "var(--text-subtle)",
            border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4,
            fontFamily: "var(--font-mono)",
          }}>⌘K</span>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Role switcher (demo) */}
        {setRole && (
          <div style={{ position: "relative" }}>
            <button onClick={() => { setRoleOpen(!roleOpen); setLangOpen(false); setNotifOpen(false); setUserOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px",
                border: `1px solid ${ROLES[role].color}`, borderRadius: 999,
                background: ROLES[role].color + "15", color: ROLES[role].color,
                cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
              }} title="Changer de rôle (démo)">
              <span style={{
                width: 22, height: 22, borderRadius: 999,
                background: ROLES[role].color, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={role === "admin" ? "shield" : role === "pharmacist" ? "stethoscope" : role === "assistant" ? "pill" : "shopping-cart"} size={12} />
              </span>
              <span>{ROLES[role].short}</span>
              <Icon name="chevron-down" size={12} />
            </button>
            {roleOpen && (
              <div style={{
                position: "absolute", top: 44, right: 0, minWidth: 260,
                background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12,
                boxShadow: "var(--shadow-lg)", padding: 6, zIndex: 100,
              }}>
                <div style={{ padding: "8px 10px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Changer de rôle · démo</div>
                {Object.values(ROLES).map(r => (
                  <div key={r.id} onClick={() => { setRole(r.id); setRoleOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                      borderRadius: 6, cursor: "pointer",
                      background: role === r.id ? "var(--bg-sunken)" : "transparent",
                    }}
                    onMouseEnter={e => { if (role !== r.id) e.currentTarget.style.background = "var(--bg-sunken)"; }}
                    onMouseLeave={e => { if (role !== r.id) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999,
                      background: r.color, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon name={r.id === "admin" ? "shield" : r.id === "pharmacist" ? "stethoscope" : r.id === "assistant" ? "pill" : "shopping-cart"} size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }} className="truncate">{r.user.name}</div>
                    </div>
                    {role === r.id && <Icon name="check" size={14} style={{ color: "var(--primary)" }} />}
                  </div>
                ))}
                <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border)", marginTop: 4, fontSize: 11, color: "var(--text-subtle)" }}>
                  L'interface s'adapte selon les permissions du rôle sélectionné.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Language */}
        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setUserOpen(false); setRoleOpen(false); }} title="Langue">
            <Icon name="globe" size={18} />
            <span style={{
              position: "absolute", bottom: 4, right: 4, fontSize: 9, fontWeight: 700,
              background: "var(--primary)", color: "white", padding: "1px 3px", borderRadius: 3,
              letterSpacing: 0.5,
            }}>{lang.toUpperCase()}</span>
          </button>
          {langOpen && (
            <div style={{
              position: "absolute", top: 44, right: 0, minWidth: 160,
              background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 10,
              boxShadow: "var(--shadow-lg)", padding: 6, zIndex: 100,
            }}>
              {[["fr", "Français", "🇫🇷"], ["en", "English", "🇬🇧"], ["ar", "العربية", "🇩🇯"]].map(([code, label]) => (
                <div key={code}
                  onClick={() => { setLang(code); setLangOpen(false); }}
                  style={{
                    padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13,
                    display: "flex", justifyContent: "space-between",
                    background: lang === code ? "var(--bg-sunken)" : "transparent",
                  }}>
                  <span>{label}</span>
                  {lang === code && <Icon name="check" size={14} style={{ color: "var(--primary)" }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme */}
        <button className="icon-btn" onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Thème">
          <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); setUserOpen(false); setRoleOpen(false); }} title="Notifications">
            <Icon name="bell" size={18} />
            <span className="icon-btn-badge">7</span>
          </button>
          {notifOpen && (
            <div style={{
              position: "absolute", top: 44, right: 0, width: 340,
              background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12,
              boxShadow: "var(--shadow-lg)", padding: 0, zIndex: 100, overflow: "hidden",
            }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 14 }}>Notifications</strong>
                <span style={{ fontSize: 12, color: "var(--primary)", cursor: "pointer" }}>Tout marquer lu</span>
              </div>
              {[
                { icon: "alert-triangle", color: "warning", title: "8 produits en péremption proche", time: "il y a 2 min" },
                { icon: "package", color: "danger", title: "Ventoline en rupture de stock", time: "il y a 1 h" },
                { icon: "shopping-cart", color: "success", title: "Vente #00425 encaissée (12 400 Fdj)", time: "il y a 3 h" },
                { icon: "truck", color: "primary", title: "Livraison UBIPHAR reçue", time: "Hier" },
              ].map((n, i) => (
                <div key={i} style={{ padding: "12px 14px", display: "flex", gap: 10, borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `var(--${n.color}-50)`, color: `var(--${n.color})`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon name={n.icon} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: 10, textAlign: "center" }}>
                <span style={{ fontSize: 13, color: "var(--primary)", cursor: "pointer" }} onClick={() => { onNavigate("notifications"); setNotifOpen(false); }}>Voir toutes les notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ position: "relative" }}>
          <button onClick={() => { setUserOpen(!userOpen); setLangOpen(false); setNotifOpen(false); setRoleOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 4px 4px",
              border: "1px solid var(--border)", borderRadius: 999, background: "var(--bg-elev)",
              cursor: "pointer",
            }}>
            <Avatar name={user.name} color={user.avatarColor} size="sm" />
            <Icon name="chevron-down" size={14} style={{ color: "var(--text-muted)", marginRight: 4 }} />
          </button>
          {userOpen && (
            <div style={{
              position: "absolute", top: 50, right: 0, minWidth: 220,
              background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12,
              boxShadow: "var(--shadow-lg)", padding: 6, zIndex: 100,
            }}>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
              </div>
              {[
                { icon: "user", label: "Mon profil" },
                { icon: "settings", label: "Paramètres" },
                { icon: "key", label: "Changer mot de passe" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-sunken)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Icon name={item.icon} size={15} />
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="divider" style={{ margin: "4px 0" }}></div>
              <div onClick={() => onNavigate("login")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "var(--danger)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--danger-50)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon name="log-out" size={15} />
                <span>Se déconnecter</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const AppShell = ({ children, breadcrumbs, activeScreen, onNavigate, lang, setLang, theme, setTheme, role, setRole }) => {
  const rtl = lang === "ar";
  return (
    <div className="app-shell" dir={rtl ? "rtl" : "ltr"}>
      <Sidebar activeScreen={activeScreen} onNavigate={onNavigate} lang={lang} theme={theme} role={role} />
      <div className="app-main">
        <Topbar breadcrumbs={breadcrumbs} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onNavigate={onNavigate} role={role} setRole={setRole} />
        <main className="app-content" key={activeScreen}>{children}</main>
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar, AppShell, AppCtx, useAppCtx });
