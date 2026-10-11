// PHARMASOFT — Mock data (Djibouti context)

const PHARMACY = {
  name: "Pharmacie Centrale Djibouti",
  address: "Avenue Maréchal Joffre, Plateau du Serpent",
  city: "Djibouti-ville",
  phone: "+253 21 35 12 34",
  nif: "12345-A",
};

const USER = {
  name: "Dr. Amina Farah",
  role: "Pharmacien titulaire",
  email: "amina.farah@pharmacie-centrale.dj",
  initials: "AF",
  avatarColor: "#0EA5E9",
};

// Translations FR / AR / EN — partial, enough to demonstrate language switching
const T = {
  fr: {
    dashboard: "Tableau de bord",
    medicines: "Médicaments",
    stock: "Stock",
    pos: "Vente / Caisse",
    clients: "Clients",
    prescriptions: "Ordonnances",
    suppliers: "Fournisseurs & Achats",
    reports: "Rapports",
    insurance: "Assurances",
    notifications: "Notifications",
    users: "Utilisateurs",
    settings: "Paramètres",
    search_global: "Rechercher un produit, client, ordonnance…",
    today_revenue: "CA du jour",
    week_revenue: "CA semaine",
    month_revenue: "CA mois",
    avg_basket: "Panier moyen",
    new_sale: "Nouvelle vente",
    new_client: "Nouveau client",
    add_medicine: "Ajouter médicament",
    inventory: "Inventaire",
    login_title: "Bon retour parmi nous",
    login_sub: "Connectez-vous pour gérer votre pharmacie",
    email: "Adresse email",
    password: "Mot de passe",
    remember: "Se souvenir de moi",
    forgot: "Mot de passe oublié ?",
    signin: "Se connecter",
    slogan: "La gestion intelligente de votre pharmacie",
    signin_sub: "Une plateforme moderne pour gérer médicaments, ventes, clients et stock — pensée pour les pharmacies de Djibouti.",
  },
  en: {
    dashboard: "Dashboard",
    medicines: "Medicines",
    stock: "Stock",
    pos: "Point of sale",
    clients: "Customers",
    prescriptions: "Prescriptions",
    suppliers: "Suppliers & Orders",
    reports: "Reports",
    insurance: "Insurance",
    notifications: "Notifications",
    users: "Users",
    settings: "Settings",
    search_global: "Search products, customers, prescriptions…",
    today_revenue: "Today's revenue",
    week_revenue: "Weekly revenue",
    month_revenue: "Monthly revenue",
    avg_basket: "Avg. basket",
    new_sale: "New sale",
    new_client: "New customer",
    add_medicine: "Add medicine",
    inventory: "Inventory",
    login_title: "Welcome back",
    login_sub: "Sign in to manage your pharmacy",
    email: "Email address",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    signin: "Sign in",
    slogan: "Smart pharmacy management",
    signin_sub: "A modern platform to manage medicines, sales, customers and stock — built for Djibouti pharmacies.",
  },
  ar: {
    dashboard: "لوحة التحكم",
    medicines: "الأدوية",
    stock: "المخزون",
    pos: "نقطة البيع",
    clients: "العملاء",
    prescriptions: "الوصفات الطبية",
    suppliers: "الموردون والمشتريات",
    reports: "التقارير",
    insurance: "التأمين",
    notifications: "الإشعارات",
    users: "المستخدمون",
    settings: "الإعدادات",
    search_global: "ابحث عن منتج، عميل، أو وصفة…",
    today_revenue: "إيرادات اليوم",
    week_revenue: "إيرادات الأسبوع",
    month_revenue: "إيرادات الشهر",
    avg_basket: "متوسط السلة",
    new_sale: "بيع جديد",
    new_client: "عميل جديد",
    add_medicine: "إضافة دواء",
    inventory: "جرد",
    login_title: "مرحبا بعودتك",
    login_sub: "سجل الدخول لإدارة صيدليتك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "هل نسيت كلمة المرور؟",
    signin: "تسجيل الدخول",
    slogan: "الإدارة الذكية لصيدليتك",
    signin_sub: "منصة حديثة لإدارة الأدوية والمبيعات والعملاء والمخزون — مصممة لصيدليات جيبوتي.",
  },
};

// Roles & per-role profile
const ROLES = {
  admin: {
    id: "admin",
    label: "Pharmacien titulaire",
    short: "Admin",
    color: "#0EA5E9",
    user: { name: "Dr. Amina Farah", role: "Pharmacien titulaire", email: "amina.farah@pharmacie-centrale.dj", avatarColor: "#0EA5E9" },
  },
  pharmacist: {
    id: "pharmacist",
    label: "Pharmacien adjoint",
    short: "Pharma. adj.",
    color: "#10B981",
    user: { name: "Dr. Houssein Bouh", role: "Pharmacien adjoint", email: "houssein.bouh@pharmacie-centrale.dj", avatarColor: "#10B981" },
  },
  assistant: {
    id: "assistant",
    label: "Assistant pharmacie",
    short: "Assistant",
    color: "#8B5CF6",
    user: { name: "Maryam Houssein", role: "Assistant pharmacie", email: "maryam.houssein@pharmacie-centrale.dj", avatarColor: "#8B5CF6" },
  },
  cashier: {
    id: "cashier",
    label: "Caissier",
    short: "Caisse",
    color: "#F59E0B",
    user: { name: "Idriss Abdallah", role: "Caissier", email: "idriss.abdallah@pharmacie-centrale.dj", avatarColor: "#F59E0B" },
  },
};

// Nav structure — each item lists which roles can access it
const NAV = [
  { key: "dashboard", icon: "layout-dashboard", screen: "dashboard", roles: ["admin", "pharmacist"] },
  { key: "pos", icon: "shopping-cart", screen: "pos", roles: ["admin", "pharmacist", "assistant", "cashier"] },
  { key: "medicines", icon: "pill", screen: "medicines", roles: ["admin", "pharmacist", "assistant"] },
  { key: "stock", icon: "package", screen: "stock", roles: ["admin", "pharmacist", "assistant"] },
  { key: "clients", icon: "users", screen: "clients", roles: ["admin", "pharmacist", "assistant", "cashier"] },
  { key: "prescriptions", icon: "file-text", screen: "prescriptions", badge: 4, roles: ["admin", "pharmacist", "assistant"] },
  { key: "suppliers", icon: "truck", screen: "suppliers", roles: ["admin", "pharmacist"] },
  { key: "reports", icon: "bar-chart", screen: "reports", roles: ["admin"] },
  { key: "insurance", icon: "shield", screen: "insurance", roles: ["admin", "pharmacist"] },
  { key: "notifications", icon: "bell", screen: "notifications", badge: 7, roles: ["admin", "pharmacist", "assistant", "cashier"] },
  { key: "users", icon: "user", screen: "users", roles: ["admin"] },
  { key: "settings", icon: "settings", screen: "settings", roles: ["admin"] },
];

// Extra (non-translated) nav for complementary modules + demos
const EXTRA_NAV = {
  modules: [
    { key: "caisse", icon: "banknote", label: "Caisse ouverture/clôture", roles: ["admin", "pharmacist", "cashier"] },
    { key: "ticket-preview", icon: "receipt", label: "Aperçu ticket", roles: ["admin", "pharmacist", "cashier"] },
  ],
  demos: [
    { key: "rtl-demo", icon: "globe", label: "Arabe RTL", roles: ["admin"] },
    { key: "dark-demo", icon: "moon", label: "Mode sombre", roles: ["admin"] },
    { key: "states", icon: "ghost", label: "404 / erreurs / vides", roles: ["admin"] },
  ],
};

// Medicines — realistic French/international brand names
const MEDICINES = [
  { id: "M001", name: "Doliprane 500mg", dci: "Paracétamol", form: "Comprimé", dosage: "500mg", lab: "Sanofi", cat: "Antalgique", price: 350, stock: 248, prescribed: false, status: "ok" },
  { id: "M002", name: "Doliprane 1g", dci: "Paracétamol", form: "Comprimé", dosage: "1g", lab: "Sanofi", cat: "Antalgique", price: 580, stock: 124, prescribed: false, status: "ok" },
  { id: "M003", name: "Efferalgan 1g", dci: "Paracétamol", form: "Comprimé eff.", dosage: "1g", lab: "UPSA", cat: "Antalgique", price: 620, stock: 18, prescribed: false, status: "low" },
  { id: "M004", name: "Amoxicilline 500mg", dci: "Amoxicilline", form: "Gélule", dosage: "500mg", lab: "Mylan", cat: "Antibiotique", price: 1450, stock: 86, prescribed: true, status: "ok" },
  { id: "M005", name: "Augmentin 1g", dci: "Amox. + Ac. clav.", form: "Comprimé", dosage: "1g", lab: "GSK", cat: "Antibiotique", price: 2890, stock: 42, prescribed: true, status: "ok" },
  { id: "M006", name: "Ventoline", dci: "Salbutamol", form: "Aérosol", dosage: "100µg", lab: "GSK", cat: "Respiratoire", price: 1850, stock: 7, prescribed: true, status: "low" },
  { id: "M007", name: "Spasfon", dci: "Phloroglucinol", form: "Comprimé", dosage: "80mg", lab: "Teva", cat: "Antispasmodique", price: 480, stock: 156, prescribed: false, status: "ok" },
  { id: "M008", name: "Smecta", dci: "Diosmectite", form: "Sachet", dosage: "3g", lab: "Ipsen", cat: "Digestif", price: 720, stock: 92, prescribed: false, status: "ok" },
  { id: "M009", name: "Imodium", dci: "Lopéramide", form: "Gélule", dosage: "2mg", lab: "Johnson", cat: "Digestif", price: 890, stock: 64, prescribed: false, status: "ok" },
  { id: "M010", name: "Voltarène", dci: "Diclofénac", form: "Comprimé", dosage: "50mg", lab: "Novartis", cat: "Anti-inflam.", price: 980, stock: 0, prescribed: true, status: "out" },
  { id: "M011", name: "Aspégic 1000", dci: "Acide acétyls.", form: "Sachet", dosage: "1000mg", lab: "Sanofi", cat: "Antalgique", price: 540, stock: 188, prescribed: false, status: "ok" },
  { id: "M012", name: "Glucophage 500", dci: "Metformine", form: "Comprimé", dosage: "500mg", lab: "Merck", cat: "Antidiabétique", price: 720, stock: 134, prescribed: true, status: "ok" },
  { id: "M013", name: "Tahor 20mg", dci: "Atorvastatine", form: "Comprimé", dosage: "20mg", lab: "Pfizer", cat: "Cardio", price: 2450, stock: 56, prescribed: true, status: "ok" },
  { id: "M014", name: "Plavix 75mg", dci: "Clopidogrel", form: "Comprimé", dosage: "75mg", lab: "Sanofi", cat: "Cardio", price: 3850, stock: 28, prescribed: true, status: "ok" },
  { id: "M015", name: "Inexium 40mg", dci: "Ésoméprazole", form: "Comprimé", dosage: "40mg", lab: "AstraZeneca", cat: "Digestif", price: 1980, stock: 5, prescribed: true, status: "low" },
  { id: "M016", name: "Stilnox 10mg", dci: "Zolpidem", form: "Comprimé", dosage: "10mg", lab: "Sanofi", cat: "Somnifère", price: 2150, stock: 14, prescribed: true, status: "low", controlled: true },
  { id: "M017", name: "Magné B6", dci: "Magnésium", form: "Comprimé", dosage: "100mg", lab: "Sanofi", cat: "Vitamines", price: 680, stock: 220, prescribed: false, status: "ok" },
  { id: "M018", name: "Vitamine C 1g", dci: "Acide ascorb.", form: "Comprimé eff.", dosage: "1g", lab: "UPSA", cat: "Vitamines", price: 420, stock: 178, prescribed: false, status: "ok" },
  { id: "M019", name: "Tot'héma", dci: "Fer + oligo.", form: "Ampoule", dosage: "50mg", lab: "Innotech", cat: "Vitamines", price: 1840, stock: 38, prescribed: false, status: "ok" },
  { id: "M020", name: "Doliprane sirop", dci: "Paracétamol", form: "Sirop", dosage: "2.4%", lab: "Sanofi", cat: "Pédiatrie", price: 950, stock: 72, prescribed: false, status: "ok" },
];

// Categories with associated tint (HSL-ish hue from primary palette family)
const CATEGORIES = [
  { id: "all", name: "Tous", icon: "grid", color: "#64748B" },
  { id: "antal", name: "Antalgiques", icon: "activity", color: "#EF4444" },
  { id: "antib", name: "Antibiotiques", icon: "syringe", color: "#0EA5E9" },
  { id: "resp", name: "Respiratoire", icon: "wifi", color: "#8B5CF6" },
  { id: "dig", name: "Digestif", icon: "leaf", color: "#10B981" },
  { id: "cardio", name: "Cardio", icon: "heart", color: "#EC4899" },
  { id: "vit", name: "Vitamines", icon: "zap", color: "#F59E0B" },
  { id: "ped", name: "Pédiatrie", icon: "user", color: "#06B6D4" },
];

// Clients
const CLIENTS = [
  { id: "C001", name: "Ahmed Hassan Ali", phone: "+253 77 12 34 56", quarter: "Plateau du Serpent", tier: "Platine", points: 1240, total: 184200, lastVisit: "2026-05-25", allergies: ["Pénicilline"] },
  { id: "C002", name: "Fatouma Mohamed Omar", phone: "+253 77 23 45 67", quarter: "Héron", tier: "Or", points: 820, total: 96400, lastVisit: "2026-05-26", allergies: [], conditions: ["Diabète II"] },
  { id: "C003", name: "Aïcha Ibrahim Bouh", phone: "+253 77 34 56 78", quarter: "Haramous", tier: "Argent", points: 420, total: 52800, lastVisit: "2026-05-20", allergies: ["Aspirine"] },
  { id: "C004", name: "Omar Ali Hassan", phone: "+253 77 45 67 89", quarter: "Balbala", tier: "Bronze", points: 180, total: 24500, lastVisit: "2026-05-18", allergies: [] },
  { id: "C005", name: "Khadija Abdou Youssouf", phone: "+253 77 56 78 90", quarter: "Gabode", tier: "Or", points: 940, total: 112300, lastVisit: "2026-05-27", allergies: [], conditions: ["Hypertension"] },
  { id: "C006", name: "Ibrahim Said Mohamed", phone: "+253 77 67 89 01", quarter: "PK12", tier: "Argent", points: 510, total: 68400, lastVisit: "2026-05-15", allergies: [] },
  { id: "C007", name: "Halima Youssouf Aden", phone: "+253 77 78 90 12", quarter: "Quartier 7", tier: "Platine", points: 1580, total: 218600, lastVisit: "2026-05-27", allergies: [], conditions: ["Asthme"] },
  { id: "C008", name: "Hassan Bouh Hassan", phone: "+253 77 89 01 23", quarter: "Arhiba", tier: "Bronze", points: 120, total: 18900, lastVisit: "2026-05-10", allergies: [] },
  { id: "C009", name: "Zahra Ahmed Ismaïl", phone: "+253 77 90 12 34", quarter: "Plateau du Serpent", tier: "Or", points: 780, total: 92400, lastVisit: "2026-05-24", allergies: ["Sulfamides"] },
  { id: "C010", name: "Mohamed Farah Hassan", phone: "+253 77 11 22 33", quarter: "Héron", tier: "Argent", points: 380, total: 48200, lastVisit: "2026-05-22", allergies: [] },
  { id: "C011", name: "Sahra Ali Bouh", phone: "+253 77 22 33 44", quarter: "Haramous", tier: "Bronze", points: 90, total: 12400, lastVisit: "2026-05-08", allergies: [] },
  { id: "C012", name: "Youssouf Ahmed Aden", phone: "+253 77 33 44 55", quarter: "Balbala", tier: "Or", points: 680, total: 84600, lastVisit: "2026-05-26", allergies: [] },
];

// Suppliers
const SUPPLIERS = [
  { id: "S001", name: "UBIPHAR Djibouti", contact: "Said Houssein", phone: "+253 21 34 11 22", balance: 1245000, lastOrder: "2026-05-20" },
  { id: "S002", name: "COPHARMED", contact: "Maryam Adan", phone: "+253 21 35 22 33", balance: 786000, lastOrder: "2026-05-23" },
  { id: "S003", name: "MEDIPHARMA DJ", contact: "Ali Mohamed", phone: "+253 21 36 33 44", balance: 412000, lastOrder: "2026-05-18" },
  { id: "S004", name: "PHARMACOP", contact: "Idriss Farah", phone: "+253 21 37 44 55", balance: 0, lastOrder: "2026-05-15" },
  { id: "S005", name: "DJIB-PHARMA", contact: "Hibo Aden", phone: "+253 21 38 55 66", balance: 234000, lastOrder: "2026-05-21" },
];

const INSURANCES = [
  { id: "I001", name: "CNSS Djibouti", coverage: 80, members: 624, due: 1840000 },
  { id: "I002", name: "AMERGA", coverage: 90, members: 312, due: 945000 },
  { id: "I003", name: "Mutuelle des Fonctionnaires", coverage: 75, members: 218, due: 412000 },
  { id: "I004", name: "GROUPE NATIO Assur.", coverage: 70, members: 156, due: 268000 },
  { id: "I005", name: "Bollore Assur. Santé", coverage: 85, members: 89, due: 142000 },
];

const fmtMoney = (n, withCurrency = true) => {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return withCurrency ? `${s} Fdj` : s;
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const tierColor = (tier) => ({
  Platine: { bg: "#E0F2FE", color: "#0284C7" },
  Or: { bg: "#FEF3C7", color: "#B45309" },
  Argent: { bg: "#F1F5F9", color: "#475569" },
  Bronze: { bg: "#FED7AA", color: "#9A3412" },
}[tier]);

// Tiny placeholder image: solid color square with first letter
const MedImage = ({ name, size = 40, radius = 8 }) => {
  // hash for color
  const colors = ["#0EA5E9", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4", "#EF4444", "#22C55E"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const bg = colors[hash % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 600, fontSize: size * 0.35,
      flexShrink: 0,
    }}>
      {name.split(" ")[0].slice(0, 2).toUpperCase()}
    </div>
  );
};

const Avatar = ({ name, size = "", color }) => {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const colors = ["#0EA5E9", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const bg = color || colors[hash % colors.length];
  return (
    <div className={`avatar ${size ? "avatar-" + size : ""}`} style={{ background: bg }}>
      {initials}
    </div>
  );
};

Object.assign(window, { PHARMACY, USER, ROLES, T, NAV, EXTRA_NAV, MEDICINES, CATEGORIES, CLIENTS, SUPPLIERS, INSURANCES, fmtMoney, fmtDate, tierColor, MedImage, Avatar });
