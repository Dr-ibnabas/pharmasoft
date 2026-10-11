/**
 * PHARMASOFT DJIBOUTI — Seed
 *
 * Charge un jeu de données réaliste pour le marché djiboutien :
 *  - 4 utilisateurs (un par rôle, mots de passe documentés dans README.md)
 *  - 1 enregistrement de paramètres pharmacie
 *  - 50 médicaments (Doliprane, Amoxicilline, Ventoline, etc.)
 *  - 5 fournisseurs (UBIPHAR, COPHARMED, ...)
 *  - 3 assurances (CNSS Djibouti, AMERGA, Mutuelle des Fonctionnaires)
 *  - 30 clients (prénoms typiques djiboutiens, quartiers de Djibouti-ville)
 *  - Lots avec péremptions variées (certains proches, d'autres lointains)
 *  - 100 ventes sur les 30 derniers jours
 *  - 20 ordonnances dont certaines en attente de validation
 *  - Notifications de démo + entrées d'audit log
 *
 * Idempotent : peut être relancé (vide d'abord les tables non-Auth puis recharge).
 * Lancement : `npx prisma db seed` (configuré dans package.json).
 */

import {
  PrismaClient,
  Prisma,
  type MedicineForm,
  type MedicineCategory,
  type PrescriptionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: ReadonlyArray<T>): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function pickN<T>(arr: ReadonlyArray<T>, n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0] as T);
  }
  return out;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

function pad(n: number, w: number): string {
  return n.toString().padStart(w, "0");
}

// ─────────────────────────────────────────────────────────────────────
// Données fixes
// ─────────────────────────────────────────────────────────────────────

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "10", 10);

const USERS = [
  {
    email: "admin@pharmasoft.dj",
    name: "Hassan Omar Aden",
    plainPassword: "Admin123!",
    role: "SUPER_ADMIN" as const,
    avatarColor: "#8B5CF6",
    validationPin: null,
  },
  {
    email: "titulaire@pharmasoft.dj",
    name: "Dr. Amina Farah",
    plainPassword: "Titulaire123!",
    role: "TITULAIRE" as const,
    avatarColor: "#1E40AF",
    validationPin: "1234", // PIN par défaut — à changer en production !
  },
  {
    email: "vendeur@pharmasoft.dj",
    name: "Maryam Houssein",
    plainPassword: "Vendeur123!",
    role: "VENDEUR" as const,
    avatarColor: "#10B981",
    validationPin: null,
  },
  {
    email: "caissier@pharmasoft.dj",
    name: "Idriss Abdallah",
    plainPassword: "Caissier123!",
    role: "CAISSIER" as const,
    avatarColor: "#F59E0B",
    validationPin: null,
  },
];

const SUPPLIERS = [
  {
    code: "S001",
    name: "UBIPHAR Djibouti",
    contact: "Said Houssein",
    phone: "+253 21 34 11 22",
    email: "contact@ubiphar.dj",
    address: "ZI Boulaos, Djibouti-ville",
    city: "Djibouti-ville",
    balance: 1_245_000,
  },
  {
    code: "S002",
    name: "COPHARMED",
    contact: "Maryam Adan",
    phone: "+253 21 35 22 33",
    email: "info@copharmed.dj",
    address: "Avenue de la République",
    city: "Djibouti-ville",
    balance: 786_000,
  },
  {
    code: "S003",
    name: "MEDIPHARMA DJ",
    contact: "Ali Mohamed",
    phone: "+253 21 36 33 44",
    email: "ventes@medipharma.dj",
    address: "Rue d'Abidjan",
    city: "Djibouti-ville",
    balance: 412_000,
  },
  {
    code: "S004",
    name: "PHARMACOP",
    contact: "Idriss Farah",
    phone: "+253 21 37 44 55",
    email: "commande@pharmacop.dj",
    address: "Zone Industrielle, Khor Ambado",
    city: "Djibouti-ville",
    balance: 0,
  },
  {
    code: "S005",
    name: "DJIB-PHARMA",
    contact: "Hibo Aden",
    phone: "+253 21 38 55 66",
    email: "contact@djibpharma.dj",
    address: "Boulevard de la République",
    city: "Djibouti-ville",
    balance: 234_000,
  },
];

const INSURANCES = [
  {
    code: "I001",
    name: "CNSS Djibouti",
    coverageRate: 80,
    contactPhone: "+253 21 35 10 00",
    contactEmail: "remboursement@cnss.dj",
    address: "Place du 27 juin, Djibouti-ville",
  },
  {
    code: "I002",
    name: "AMERGA",
    coverageRate: 90,
    contactPhone: "+253 21 35 88 00",
    contactEmail: "sinistres@amerga.dj",
    address: "Avenue Maréchal Joffre",
  },
  {
    code: "I003",
    name: "Mutuelle des Fonctionnaires",
    coverageRate: 75,
    contactPhone: "+253 21 35 22 50",
    contactEmail: "mutuelle@finances.gov.dj",
    address: "Ministère des Finances",
  },
];

// 50 médicaments — extension du jeu de la maquette + ajouts cohérents pour Djibouti.
const MEDICINES = [
  // Antalgiques
  { code: "M001", name: "Doliprane 500mg", dci: "Paracétamol", form: "COMPRIME", dosage: "500mg", laboratory: "Sanofi", category: "ANTALGIQUE", sellPrice: 350, purchasePrice: 220, requiresPrescription: false },
  { code: "M002", name: "Doliprane 1g", dci: "Paracétamol", form: "COMPRIME", dosage: "1g", laboratory: "Sanofi", category: "ANTALGIQUE", sellPrice: 580, purchasePrice: 380, requiresPrescription: false },
  { code: "M003", name: "Efferalgan 1g", dci: "Paracétamol", form: "COMPRIME_EFFERVESCENT", dosage: "1g", laboratory: "UPSA", category: "ANTALGIQUE", sellPrice: 620, purchasePrice: 410, requiresPrescription: false },
  { code: "M004", name: "Aspégic 1000", dci: "Acide acétylsalicylique", form: "SACHET", dosage: "1000mg", laboratory: "Sanofi", category: "ANTALGIQUE", sellPrice: 540, purchasePrice: 340, requiresPrescription: false },
  { code: "M005", name: "Ixprim", dci: "Tramadol + Paracétamol", form: "COMPRIME", dosage: "37.5+325mg", laboratory: "Grünenthal", category: "ANTALGIQUE", sellPrice: 1_850, purchasePrice: 1_220, requiresPrescription: true, controlledSubstance: true },
  // Antibiotiques
  { code: "M006", name: "Amoxicilline 500mg", dci: "Amoxicilline", form: "GELULE", dosage: "500mg", laboratory: "Mylan", category: "ANTIBIOTIQUE", sellPrice: 1_450, purchasePrice: 920, requiresPrescription: true },
  { code: "M007", name: "Augmentin 1g", dci: "Amoxicilline + Acide clavulanique", form: "COMPRIME", dosage: "1g", laboratory: "GSK", category: "ANTIBIOTIQUE", sellPrice: 2_890, purchasePrice: 1_950, requiresPrescription: true },
  { code: "M008", name: "Clamoxyl 1g", dci: "Amoxicilline", form: "COMPRIME", dosage: "1g", laboratory: "GSK", category: "ANTIBIOTIQUE", sellPrice: 1_980, purchasePrice: 1_280, requiresPrescription: true },
  { code: "M009", name: "Ciflox 500", dci: "Ciprofloxacine", form: "COMPRIME", dosage: "500mg", laboratory: "Sanofi", category: "ANTIBIOTIQUE", sellPrice: 2_240, purchasePrice: 1_460, requiresPrescription: true },
  { code: "M010", name: "Zithromax 250mg", dci: "Azithromycine", form: "COMPRIME", dosage: "250mg", laboratory: "Pfizer", category: "ANTIBIOTIQUE", sellPrice: 3_200, purchasePrice: 2_180, requiresPrescription: true },
  // Respiratoire
  { code: "M011", name: "Ventoline", dci: "Salbutamol", form: "AEROSOL", dosage: "100µg/dose", laboratory: "GSK", category: "RESPIRATOIRE", sellPrice: 1_850, purchasePrice: 1_220, requiresPrescription: true },
  { code: "M012", name: "Seretide 25/250", dci: "Salmétérol + Fluticasone", form: "AEROSOL", dosage: "25/250µg", laboratory: "GSK", category: "RESPIRATOIRE", sellPrice: 8_400, purchasePrice: 5_980, requiresPrescription: true },
  { code: "M013", name: "Toplexil", dci: "Oxomémazine", form: "SIROP", dosage: "0.33mg/ml", laboratory: "Sanofi", category: "RESPIRATOIRE", sellPrice: 1_240, purchasePrice: 820, requiresPrescription: false },
  { code: "M014", name: "Maxilase 200mg", dci: "Alpha-amylase", form: "COMPRIME", dosage: "200mg", laboratory: "Bayer", category: "RESPIRATOIRE", sellPrice: 980, purchasePrice: 620, requiresPrescription: false },
  // Digestif
  { code: "M015", name: "Spasfon", dci: "Phloroglucinol", form: "COMPRIME", dosage: "80mg", laboratory: "Teva", category: "ANTISPASMODIQUE", sellPrice: 480, purchasePrice: 290, requiresPrescription: false },
  { code: "M016", name: "Smecta", dci: "Diosmectite", form: "SACHET", dosage: "3g", laboratory: "Ipsen", category: "DIGESTIF", sellPrice: 720, purchasePrice: 460, requiresPrescription: false },
  { code: "M017", name: "Imodium", dci: "Lopéramide", form: "GELULE", dosage: "2mg", laboratory: "Johnson", category: "DIGESTIF", sellPrice: 890, purchasePrice: 580, requiresPrescription: false },
  { code: "M018", name: "Inexium 40mg", dci: "Ésoméprazole", form: "COMPRIME", dosage: "40mg", laboratory: "AstraZeneca", category: "DIGESTIF", sellPrice: 1_980, purchasePrice: 1_320, requiresPrescription: true },
  { code: "M019", name: "Mopral 20mg", dci: "Oméprazole", form: "GELULE", dosage: "20mg", laboratory: "AstraZeneca", category: "DIGESTIF", sellPrice: 1_580, purchasePrice: 1_020, requiresPrescription: true },
  { code: "M020", name: "Gaviscon", dci: "Alginate + Bicarbonate", form: "SACHET", dosage: "10ml", laboratory: "Reckitt", category: "DIGESTIF", sellPrice: 980, purchasePrice: 620, requiresPrescription: false },
  // Anti-inflammatoires
  { code: "M021", name: "Voltarène 50mg", dci: "Diclofénac", form: "COMPRIME", dosage: "50mg", laboratory: "Novartis", category: "ANTI_INFLAMMATOIRE", sellPrice: 980, purchasePrice: 620, requiresPrescription: true },
  { code: "M022", name: "Profénid 100mg", dci: "Kétoprofène", form: "COMPRIME", dosage: "100mg", laboratory: "Sanofi", category: "ANTI_INFLAMMATOIRE", sellPrice: 1_120, purchasePrice: 740, requiresPrescription: true },
  { code: "M023", name: "Brufen 400mg", dci: "Ibuprofène", form: "COMPRIME", dosage: "400mg", laboratory: "Mylan", category: "ANTI_INFLAMMATOIRE", sellPrice: 620, purchasePrice: 380, requiresPrescription: false },
  // Cardiologie
  { code: "M024", name: "Tahor 20mg", dci: "Atorvastatine", form: "COMPRIME", dosage: "20mg", laboratory: "Pfizer", category: "CARDIO", sellPrice: 2_450, purchasePrice: 1_620, requiresPrescription: true },
  { code: "M025", name: "Plavix 75mg", dci: "Clopidogrel", form: "COMPRIME", dosage: "75mg", laboratory: "Sanofi", category: "CARDIO", sellPrice: 3_850, purchasePrice: 2_580, requiresPrescription: true },
  { code: "M026", name: "Aprovel 150mg", dci: "Irbésartan", form: "COMPRIME", dosage: "150mg", laboratory: "Sanofi", category: "CARDIO", sellPrice: 2_180, purchasePrice: 1_450, requiresPrescription: true },
  { code: "M027", name: "Cozaar 50mg", dci: "Losartan", form: "COMPRIME", dosage: "50mg", laboratory: "MSD", category: "CARDIO", sellPrice: 1_980, purchasePrice: 1_320, requiresPrescription: true },
  { code: "M028", name: "Préviscan 20mg", dci: "Fluindione", form: "COMPRIME", dosage: "20mg", laboratory: "Merck", category: "CARDIO", sellPrice: 1_650, purchasePrice: 1_080, requiresPrescription: true },
  // Antidiabétiques
  { code: "M029", name: "Glucophage 500", dci: "Metformine", form: "COMPRIME", dosage: "500mg", laboratory: "Merck", category: "ANTIDIABETIQUE", sellPrice: 720, purchasePrice: 460, requiresPrescription: true },
  { code: "M030", name: "Glucophage 850", dci: "Metformine", form: "COMPRIME", dosage: "850mg", laboratory: "Merck", category: "ANTIDIABETIQUE", sellPrice: 920, purchasePrice: 580, requiresPrescription: true },
  { code: "M031", name: "Diamicron MR 30", dci: "Gliclazide", form: "COMPRIME", dosage: "30mg", laboratory: "Servier", category: "ANTIDIABETIQUE", sellPrice: 1_840, purchasePrice: 1_210, requiresPrescription: true },
  { code: "M032", name: "Lantus 100UI", dci: "Insuline glargine", form: "INJECTABLE", dosage: "100UI/ml", laboratory: "Sanofi", category: "ANTIDIABETIQUE", sellPrice: 12_500, purchasePrice: 9_200, requiresPrescription: true },
  // Somnifères / contrôlés
  { code: "M033", name: "Stilnox 10mg", dci: "Zolpidem", form: "COMPRIME", dosage: "10mg", laboratory: "Sanofi", category: "SOMNIFERE", sellPrice: 2_150, purchasePrice: 1_420, requiresPrescription: true, controlledSubstance: true },
  { code: "M034", name: "Lexomil 6mg", dci: "Bromazépam", form: "COMPRIME", dosage: "6mg", laboratory: "Roche", category: "SOMNIFERE", sellPrice: 1_980, purchasePrice: 1_310, requiresPrescription: true, controlledSubstance: true },
  // Vitamines
  { code: "M035", name: "Magné B6", dci: "Magnésium + Pyridoxine", form: "COMPRIME", dosage: "100mg", laboratory: "Sanofi", category: "VITAMINES", sellPrice: 680, purchasePrice: 420, requiresPrescription: false },
  { code: "M036", name: "Vitamine C 1g", dci: "Acide ascorbique", form: "COMPRIME_EFFERVESCENT", dosage: "1g", laboratory: "UPSA", category: "VITAMINES", sellPrice: 420, purchasePrice: 260, requiresPrescription: false },
  { code: "M037", name: "Tot'héma", dci: "Fer + oligo-éléments", form: "AMPOULE", dosage: "50mg", laboratory: "Innotech", category: "VITAMINES", sellPrice: 1_840, purchasePrice: 1_210, requiresPrescription: false },
  { code: "M038", name: "Berocca", dci: "Multivitamines B+C", form: "COMPRIME_EFFERVESCENT", dosage: "1g", laboratory: "Bayer", category: "VITAMINES", sellPrice: 1_240, purchasePrice: 820, requiresPrescription: false },
  { code: "M039", name: "Centrum Adulte", dci: "Multivitamines complet", form: "COMPRIME", dosage: "—", laboratory: "Pfizer", category: "VITAMINES", sellPrice: 4_200, purchasePrice: 2_980, requiresPrescription: false },
  // Pédiatrie
  { code: "M040", name: "Doliprane sirop", dci: "Paracétamol", form: "SIROP", dosage: "2.4%", laboratory: "Sanofi", category: "PEDIATRIE", sellPrice: 950, purchasePrice: 620, requiresPrescription: false },
  { code: "M041", name: "Advil enfant", dci: "Ibuprofène", form: "SIROP", dosage: "20mg/ml", laboratory: "Pfizer", category: "PEDIATRIE", sellPrice: 1_240, purchasePrice: 820, requiresPrescription: false },
  { code: "M042", name: "Clamoxyl pédiatrique", dci: "Amoxicilline", form: "SIROP", dosage: "125mg/5ml", laboratory: "GSK", category: "PEDIATRIE", sellPrice: 1_680, purchasePrice: 1_120, requiresPrescription: true },
  { code: "M043", name: "Drill miel-citron", dci: "Tétracaïne", form: "COMPRIME", dosage: "—", laboratory: "Pierre Fabre", category: "PEDIATRIE", sellPrice: 720, purchasePrice: 460, requiresPrescription: false },
  // Antipaludéens (contexte Djibouti)
  { code: "M044", name: "Coartem", dci: "Artéméther + Luméfantrine", form: "COMPRIME", dosage: "20/120mg", laboratory: "Novartis", category: "AUTRE", sellPrice: 3_840, purchasePrice: 2_580, requiresPrescription: true, controlledSubstance: false, description: "Antipaludéen — réservé aux formes simples à Plasmodium falciparum" },
  { code: "M045", name: "Plaquénil 200mg", dci: "Hydroxychloroquine", form: "COMPRIME", dosage: "200mg", laboratory: "Sanofi", category: "AUTRE", sellPrice: 2_640, purchasePrice: 1_720, requiresPrescription: true },
  // Dermatologie / divers
  { code: "M046", name: "Biafine", dci: "Trolamine", form: "POMMADE", dosage: "0.67%", laboratory: "Johnson", category: "AUTRE", sellPrice: 2_180, purchasePrice: 1_420, requiresPrescription: false },
  { code: "M047", name: "Hexomédine", dci: "Hexamidine", form: "AUTRE", dosage: "0.1%", laboratory: "Boehringer", category: "AUTRE", sellPrice: 1_480, purchasePrice: 960, requiresPrescription: false },
  { code: "M048", name: "Daktarin gel", dci: "Miconazole", form: "POMMADE", dosage: "2%", laboratory: "Johnson", category: "AUTRE", sellPrice: 1_780, purchasePrice: 1_180, requiresPrescription: false },
  { code: "M049", name: "Locatop 0.1%", dci: "Désonide", form: "POMMADE", dosage: "0.1%", laboratory: "Pierre Fabre", category: "AUTRE", sellPrice: 2_120, purchasePrice: 1_410, requiresPrescription: true },
  { code: "M050", name: "Bétadine dermique", dci: "Povidone iodée", form: "AUTRE", dosage: "10%", laboratory: "Meda", category: "AUTRE", sellPrice: 1_360, purchasePrice: 880, requiresPrescription: false },
];

// Prénoms et noms djiboutiens typiques (mix afar / somali / arabe).
const FIRST_NAMES = [
  "Ahmed", "Fatouma", "Aïcha", "Omar", "Khadija", "Ibrahim", "Halima", "Hassan",
  "Zahra", "Mohamed", "Sahra", "Youssouf", "Idriss", "Maryam", "Said", "Houssein",
  "Hibo", "Abdou", "Farah", "Amina", "Bouh", "Aden", "Doualeh", "Roda",
  "Soumaya", "Mahamoud", "Daher", "Asma", "Kadra", "Iman",
];
const LAST_NAMES = [
  "Hassan", "Mohamed", "Omar", "Aden", "Houssein", "Farah", "Ali", "Bouh",
  "Ibrahim", "Said", "Abdou", "Youssouf", "Adan", "Ismaïl", "Daher", "Ahmed",
];
const QUARTERS = [
  "Plateau du Serpent", "Héron", "Haramous", "Balbala", "Gabode", "PK12",
  "Quartier 7", "Arhiba", "Marabout", "Boulaos", "Quartier 3",
];

// Médecins prescripteurs (mock)
const DOCTORS = [
  { name: "Dr. Hawa Souleyman", contact: "+253 77 12 00 11" },
  { name: "Dr. Robleh Ahmed", contact: "+253 77 12 00 22" },
  { name: "Dr. Nasra Bouh", contact: "+253 77 12 00 33" },
  { name: "Dr. Mahdi Farah", contact: "+253 77 12 00 44" },
  { name: "Dr. Asli Mohamed", contact: "+253 77 12 00 55" },
];

const ALLERGIES_POOL = ["Pénicilline", "Aspirine", "Sulfamides", "Iode", "Codéine"];
const CONDITIONS_POOL = ["Diabète II", "Hypertension", "Asthme", "Insuffisance rénale légère", "Glaucome"];

// ─────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────

async function reset(): Promise<void> {
  // Ordre inverse des FKs pour respecter les contraintes
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.saleLine.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cashSession.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.insuranceMember.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.client.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  console.log("👤 Création des 4 utilisateurs...");
  for (const u of USERS) {
    const hashedPassword = await bcrypt.hash(u.plainPassword, SALT_ROUNDS);
    const hashedPin = u.validationPin ? await bcrypt.hash(u.validationPin, SALT_ROUNDS) : null;
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        hashedPassword,
        validationPin: hashedPin,
        role: u.role,
        avatarColor: u.avatarColor,
        locale: "FR",
        emailVerified: new Date(),
        isActive: true,
      },
    });
  }
}

async function seedSettings() {
  console.log("⚙️  Paramètres pharmacie...");
  await prisma.setting.create({
    data: {
      pharmacyName: process.env.NEXT_PUBLIC_PHARMACY_NAME ?? "Pharmacie Centrale Djibouti",
      address: process.env.NEXT_PUBLIC_PHARMACY_ADDRESS ?? "Avenue Maréchal Joffre, Plateau du Serpent",
      city: process.env.NEXT_PUBLIC_PHARMACY_CITY ?? "Djibouti-ville",
      phone: process.env.NEXT_PUBLIC_PHARMACY_PHONE ?? "+253 21 35 12 34",
      email: "contact@pharmacie-centrale.dj",
      nif: process.env.NEXT_PUBLIC_PHARMACY_NIF ?? "12345-A",
      tvaRate: new Prisma.Decimal(parseFloat(process.env.NEXT_PUBLIC_TVA_RATE ?? "0.10")),
      defaultLocale: "FR",
      lowStockDefault: 20,
      expiryWarnDays: 90,
      expiryAlertDays: 30,
    },
  });
}

async function seedSuppliers() {
  console.log("🚛 5 fournisseurs...");
  for (const s of SUPPLIERS) {
    await prisma.supplier.create({ data: s });
  }
}

async function seedInsurances() {
  console.log("🛡️  3 assurances...");
  for (const ins of INSURANCES) {
    await prisma.insurance.create({ data: ins });
  }
}

async function seedMedicines() {
  console.log("💊 50 médicaments + lots avec péremptions variées...");
  const suppliers = await prisma.supplier.findMany();
  for (const m of MEDICINES) {
    const created = await prisma.medicine.create({
      data: {
        code: m.code,
        barcode: `61700${m.code.slice(1)}`,    // EAN-13 fictif Djibouti (préfixe 617)
        name: m.name,
        dci: m.dci,
        form: m.form as MedicineForm,
        dosage: m.dosage,
        laboratory: m.laboratory,
        category: m.category as MedicineCategory,
        sellPrice: m.sellPrice,
        purchasePrice: m.purchasePrice,
        requiresPrescription: m.requiresPrescription,
        controlledSubstance: m.controlledSubstance ?? false,
        lowStockThreshold: 20,
        description: m.description ?? null,
      },
    });

    // 1 à 3 lots par médicament avec péremptions variées
    const lotCount = randomInt(1, 3);
    for (let i = 0; i < lotCount; i++) {
      const supplier = pick(suppliers);
      // Répartition des péremptions :
      //  - 15% urgent (≤ 30 jours)
      //  - 25% proche (30-90 jours)
      //  - 60% safe (3 mois à 2 ans)
      const r = Math.random();
      let expiryDays: number;
      if (r < 0.15) expiryDays = randomInt(3, 30);
      else if (r < 0.4) expiryDays = randomInt(31, 90);
      else expiryDays = randomInt(120, 730);

      // Distribution du stock : 8% rupture, 15% bas (<20), reste OK
      const stockRoll = Math.random();
      let qty: number;
      if (stockRoll < 0.08) qty = 0;
      else if (stockRoll < 0.23) qty = randomInt(1, 18);
      else qty = randomInt(40, 300);

      await prisma.lot.create({
        data: {
          medicineId: created.id,
          lotNumber: `LOT-${m.code}-${pad(i + 1, 2)}`,
          quantity: qty,
          initialQty: qty + randomInt(0, 50),
          expiryDate: daysFromNow(expiryDays),
          receivedAt: daysFromNow(-randomInt(15, 120)),
          supplierId: supplier?.id ?? null,
          purchasePrice: m.purchasePrice,
        },
      });
    }
  }
}

async function seedClients() {
  console.log("👥 30 clients djiboutiens...");
  const tiers: ("BRONZE" | "ARGENT" | "OR" | "PLATINE")[] = ["BRONZE", "ARGENT", "OR", "PLATINE"];
  for (let i = 1; i <= 30; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const middle = pick(FIRST_NAMES);
    const name = `${first} ${middle} ${last}`;
    const tier = pick(tiers);

    const allergies = Math.random() < 0.25 ? [pick(ALLERGIES_POOL)] : [];
    const conditions = Math.random() < 0.30 ? [pick(CONDITIONS_POOL)] : [];

    await prisma.client.create({
      data: {
        code: `C${pad(i, 3)}`,
        name,
        phone: `+253 77 ${pad(randomInt(10, 99), 2)} ${pad(randomInt(10, 99), 2)} ${pad(randomInt(10, 99), 2)}`,
        email: Math.random() < 0.3 ? `${first.toLowerCase()}.${last.toLowerCase()}@email.dj` : null,
        gender: Math.random() < 0.55 ? "M" : "F",
        quarter: pick(QUARTERS),
        tier,
        points: tier === "PLATINE" ? randomInt(1000, 2000) :
                tier === "OR" ? randomInt(500, 1000) :
                tier === "ARGENT" ? randomInt(200, 500) : randomInt(0, 200),
        totalSpent: 0, // sera mis à jour après les ventes
        allergies,
        conditions,
        dateOfBirth: new Date(randomInt(1955, 2010), randomInt(0, 11), randomInt(1, 28)),
      },
    });
  }
}

async function seedInsuranceMembers() {
  console.log("🪪 Adhésions assurance (clients ↔ assureurs)...");
  const insurances = await prisma.insurance.findMany();
  const clients = await prisma.client.findMany();
  // ~40% des clients ont une couverture
  const covered = pickN(clients, Math.floor(clients.length * 0.4));
  for (const c of covered) {
    const ins = pick(insurances);
    await prisma.insuranceMember.create({
      data: {
        insuranceId: ins.id,
        clientId: c.id,
        memberNumber: `${ins.code}-${pad(randomInt(10000, 99999), 5)}`,
        validFrom: daysFromNow(-randomInt(60, 720)),
        validUntil: daysFromNow(randomInt(60, 720)),
        isActive: true,
      },
    });
  }
}

async function seedSalesAndPrescriptions() {
  console.log("🧾 Ouverture session de caisse + 100 ventes sur 30 jours + 20 ordonnances...");
  const users = await prisma.user.findMany();
  const cashier = users.find((u) => u.role === "CAISSIER");
  const titulaire = users.find((u) => u.role === "TITULAIRE");
  const vendor = users.find((u) => u.role === "VENDEUR");
  if (!cashier || !titulaire || !vendor) {
    throw new Error("Utilisateurs requis manquants dans le seed.");
  }
  const sellingUsers = [cashier, vendor, titulaire];

  const medicines = await prisma.medicine.findMany({ include: { lots: true } });
  const clients = await prisma.client.findMany({ include: { insuranceMembers: { include: { insurance: true } } } });

  // Une session de caisse "ouverte" (du jour)
  const todaySession = await prisma.cashSession.create({
    data: {
      userId: cashier.id,
      openedAt: new Date(new Date().setHours(8, 30, 0, 0)),
      openingFloat: 20_000,
    },
  });

  // 20 ordonnances : mix PENDING / PARTIAL / FULFILLED
  const prescriptions = [];
  for (let i = 1; i <= 20; i++) {
    const client = pick(clients);
    const issuedDaysAgo = randomInt(0, 25);
    const doctor = pick(DOCTORS);
    // Sélection 1-4 médicaments sous ordonnance pour cette prescription
    const rxMeds = pickN(medicines.filter((m) => m.requiresPrescription), randomInt(1, 4));

    const status =
      i <= 4 ? "PENDING" :
      i <= 10 ? "PARTIAL" :
      i <= 17 ? "FULFILLED" : "EXPIRED";

    const prescription = await prisma.prescription.create({
      data: {
        code: `RX-2026-${pad(i, 5)}`,
        clientId: client.id,
        doctorName: doctor.name,
        doctorContact: doctor.contact,
        issuedDate: daysFromNow(-issuedDaysAgo),
        expiresAt: daysFromNow(365 - issuedDaysAgo),
        status: status as PrescriptionStatus,
        validatedByUserId: status !== "PENDING" ? titulaire.id : null,
        validatedAt: status !== "PENDING" ? daysFromNow(-issuedDaysAgo + 1) : null,
        items: {
          create: rxMeds.map((m) => ({
            medicineId: m.id,
            quantity: randomInt(10, 60),
            dispensedQty:
              status === "FULFILLED" ? randomInt(10, 60) :
              status === "PARTIAL" ? randomInt(1, 10) : 0,
            posology: pick(["1cp x 3/j x 7j", "1cp x 2/j x 5j", "1cp matin x 30j", "1cp x 3/j si douleur"]),
            duration: pick(["5 jours", "7 jours", "10 jours", "1 mois"]),
          })),
        },
      },
    });
    prescriptions.push(prescription);
  }

  // 100 ventes sur 30 derniers jours — distribution réaliste : cash dominant,
  // puis card/D-Money/Waafi, plus rare pour insurance/credit.
  const weighted = [
    "CASH", "CASH", "CASH", "CASH", "CARD", "CARD", "DMONEY", "DMONEY", "WAAFI", "INSURANCE", "CREDIT",
  ] as const;
  let ticketCounter = 1;

  for (let i = 0; i < 100; i++) {
    const daysAgo = randomInt(0, 29);
    const saleDate = daysFromNow(-daysAgo);
    saleDate.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);

    const lineCount = randomInt(1, 5);
    const selectedMeds = pickN(medicines.filter((m) => m.lots.some((l) => l.quantity > 0)), lineCount);
    if (selectedMeds.length === 0) continue;

    const client = Math.random() < 0.7 ? pick(clients) : null;
    const user = pick(sellingUsers);
    const paymentMethod = pick(weighted);
    const discountPercent = Math.random() < 0.2 ? pick([5, 10, 15]) : 0;

    let subtotal = 0;
    const linesData: Array<{
      medicineId: string;
      lotId: string;
      quantity: number;
      unitPrice: number;
      discountPercent: Prisma.Decimal;
      lineTotal: number;
    }> = [];

    for (const m of selectedMeds) {
      const qty = randomInt(1, 4);
      const lot = m.lots.find((l) => l.quantity > 0);
      if (!lot) continue;
      const lineTotal = m.sellPrice * qty;
      subtotal += lineTotal;
      linesData.push({
        medicineId: m.id,
        lotId: lot.id,
        quantity: qty,
        unitPrice: m.sellPrice,
        discountPercent: new Prisma.Decimal(0),
        lineTotal,
      });
    }

    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const taxableBase = subtotal - discountAmount;
    const taxAmount = Math.round(taxableBase * 0.10);
    const total = taxableBase + taxAmount;

    const isToday = daysAgo === 0;

    const sale = await prisma.sale.create({
      data: {
        ticketNumber: `#${pad(ticketCounter++, 5)}`,
        userId: user.id,
        clientId: client?.id ?? null,
        cashSessionId: isToday && user.id === cashier.id ? todaySession.id : null,
        subtotal,
        discountPercent: new Prisma.Decimal(discountPercent),
        discountAmount,
        taxRate: new Prisma.Decimal(0.10),
        taxAmount,
        total,
        paymentMethod,
        paymentRef: paymentMethod === "DMONEY" || paymentMethod === "WAAFI" ?
          `TX${pad(randomInt(100000, 999999), 6)}` : null,
        status: "COMPLETED",
        createdAt: saleDate,
        lines: { create: linesData },
      },
    });

    // Insurance claim si paiement via assurance
    if (paymentMethod === "INSURANCE" && client) {
      const member = client.insuranceMembers[0];
      if (member) {
        const amountClaimed = Math.round(total * (member.insurance.coverageRate / 100));
        await prisma.insuranceClaim.create({
          data: {
            saleId: sale.id,
            insuranceId: member.insuranceId,
            amountClaimed,
            status: "PENDING",
          },
        });
      }
    }

    // Mouvement de stock — décrémente chaque lot vendu
    for (const line of linesData) {
      await prisma.lot.update({
        where: { id: line.lotId },
        data: { quantity: { decrement: line.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          medicineId: line.medicineId,
          lotId: line.lotId,
          type: "OUT_SALE",
          quantity: -line.quantity,
          reference: sale.id,
          userId: user.id,
          createdAt: saleDate,
        },
      });
    }

    // Mise à jour totalSpent + lastVisit du client
    if (client) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          totalSpent: { increment: total },
          lastVisit: saleDate,
          creditBalance: paymentMethod === "CREDIT" ? { increment: total } : undefined,
          points: { increment: Math.floor(total / 100) },
        },
      });
    }
  }

  // Recalcul expectedAmount de la session du jour
  const todayCashSales = await prisma.sale.aggregate({
    where: { cashSessionId: todaySession.id, paymentMethod: "CASH" },
    _sum: { total: true },
  });
  await prisma.cashSession.update({
    where: { id: todaySession.id },
    data: {
      expectedAmount: (todayCashSales._sum.total ?? 0) + todaySession.openingFloat,
    },
  });
}

async function seedNotifications() {
  console.log("🔔 Notifications de démo...");
  const titulaire = await prisma.user.findFirst({ where: { role: "TITULAIRE" } });
  if (!titulaire) return;

  const lowStockLots = await prisma.lot.findMany({
    where: { quantity: { lte: 20, gt: 0 } },
    include: { medicine: true },
    take: 3,
  });
  const outOfStockMeds = await prisma.medicine.findMany({
    where: { lots: { every: { quantity: 0 } } },
    take: 2,
  });
  const expiringLots = await prisma.lot.findMany({
    where: { expiryDate: { lte: daysFromNow(30), gte: new Date() }, quantity: { gt: 0 } },
    include: { medicine: true },
    take: 3,
  });

  const notifs: Prisma.NotificationCreateManyInput[] = [];
  for (const l of lowStockLots) {
    notifs.push({
      type: "STOCK_LOW",
      title: `Stock bas : ${l.medicine.name}`,
      message: `Le lot ${l.lotNumber} n'a plus que ${l.quantity} unités.`,
      link: `/medicaments/${l.medicineId}`,
    });
  }
  for (const m of outOfStockMeds) {
    notifs.push({
      type: "STOCK_OUT",
      title: `Rupture : ${m.name}`,
      message: `Ce produit est en rupture. À recommander rapidement.`,
      link: `/medicaments/${m.id}`,
    });
  }
  for (const l of expiringLots) {
    notifs.push({
      type: "EXPIRY_URGENT",
      title: `Péremption urgente : ${l.medicine.name}`,
      message: `Le lot ${l.lotNumber} expire le ${l.expiryDate.toLocaleDateString("fr-FR")}.`,
      link: `/stock?lot=${l.id}`,
    });
  }
  if (notifs.length > 0) {
    await prisma.notification.createMany({ data: notifs });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("🌱 PHARMASOFT — Seed en cours...\n");
  await reset();
  await seedUsers();
  await seedSettings();
  await seedSuppliers();
  await seedInsurances();
  await seedMedicines();
  await seedClients();
  await seedInsuranceMembers();
  await seedSalesAndPrescriptions();
  await seedNotifications();

  // Résumé
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.medicine.count(),
    prisma.lot.count(),
    prisma.client.count(),
    prisma.supplier.count(),
    prisma.insurance.count(),
    prisma.sale.count(),
    prisma.saleLine.count(),
    prisma.prescription.count(),
    prisma.notification.count(),
  ]);
  console.log("\n✅ Seed terminé :");
  console.log(`   ${counts[0]} utilisateurs (4 rôles)`);
  console.log(`   ${counts[1]} médicaments / ${counts[2]} lots`);
  console.log(`   ${counts[3]} clients`);
  console.log(`   ${counts[4]} fournisseurs / ${counts[5]} assurances`);
  console.log(`   ${counts[6]} ventes / ${counts[7]} lignes de vente`);
  console.log(`   ${counts[8]} ordonnances`);
  console.log(`   ${counts[9]} notifications\n`);
  console.log("🔑 Comptes :");
  for (const u of USERS) {
    console.log(`   ${u.role.padEnd(12)}  ${u.email.padEnd(28)}  ${u.plainPassword}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
