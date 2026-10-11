"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";
import {
  Search,
  ScanLine,
  Filter,
  Trash2,
  Plus,
  Minus,
  X,
  UserPlus,
  ShoppingCart,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { MedImage } from "@/components/charts/med-image";
import { CheckoutDialog } from "@/components/pos/checkout-dialog";
import { cn, computeCartTotals, fmtMoney, colorFromString, initials } from "@/lib/utils";

interface MedicineOption {
  id: string;
  code: string;
  name: string;
  dci: string;
  form: string;
  laboratory: string;
  category: string;
  sellPrice: number;
  stock: number;
  requiresPrescription: boolean;
}

interface ClientOption {
  id: string;
  name: string;
  phone: string;
  tier: string;
  points: number;
  insuranceName?: string | null;
  coverageRate?: number | null;
}

interface CartLine {
  medicineId: string;
  name: string;
  price: number;
  qty: number;
  requiresPrescription: boolean;
}

interface HeldTicket {
  id: number;
  cart: CartLine[];
  client: ClientOption | null;
  discount: number;
}

interface PosScreenProps {
  medicines: MedicineOption[];
  clients: ClientOption[];
  categories: { id: string; name: string; color: string }[];
  role: Role;
  locale: string;
  tvaRate: number;
}

// PHARMASOFT — Écran POS principal. Produits à gauche, panier sticky à droite.
// L'encaissement (paiement mixte, tiers-payant, monnaie, fidélité) est délégué au CheckoutDialog.
export function PosScreen({ medicines, clients, categories, role, locale, tvaRate }: PosScreenProps) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [client, setClient] = useState<ClientOption | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [held, setHeld] = useState<HeldTicket[]>([]);
  const [showHeld, setShowHeld] = useState(false);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      if (
        search &&
        !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.dci.toLowerCase().includes(search.toLowerCase()) &&
        !m.code.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (cat !== "all" && m.category !== cat) return false;
      return true;
    });
  }, [medicines, search, cat]);

  const totals = useMemo(
    () => computeCartTotals({ lines: cart, discountPercent: discount, tvaRate }),
    [cart, discount, tvaRate],
  );

  function addToCart(m: MedicineOption) {
    if (m.stock === 0) {
      toast.error(`${m.name} en rupture`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((p) => p.medicineId === m.id);
      if (existing) {
        if (existing.qty + 1 > m.stock) {
          toast.error(`Stock max atteint (${m.stock})`);
          return prev;
        }
        return prev.map((p) => (p.medicineId === m.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { medicineId: m.id, name: m.name, price: m.sellPrice, qty: 1, requiresPrescription: m.requiresPrescription }];
    });
  }
  function updateQty(id: string, delta: number) {
    setCart((prev) => prev.map((p) => (p.medicineId === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p)).filter((p) => p.qty > 0));
  }
  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((p) => p.medicineId !== id));
  }

  // Mise en attente : parquer le ticket courant et repartir d'un panier vide
  function holdTicket() {
    if (cart.length === 0) return;
    setHeld((prev) => [...prev, { id: Date.now() % 100000, cart, client, discount }]);
    setCart([]);
    setClient(null);
    setDiscount(0);
    toast.success("Ticket mis en attente");
  }
  function resumeTicket(t: HeldTicket) {
    if (cart.length > 0) {
      setHeld((prev) => [...prev, { id: Date.now() % 100000, cart, client, discount }]);
    }
    setCart(t.cart);
    setClient(t.client);
    setDiscount(t.discount);
    setHeld((prev) => prev.filter((h) => h.id !== t.id));
    setShowHeld(false);
  }

  return (
    <div className="-m-8 grid min-h-[calc(100vh-64px)] grid-cols-[1fr_440px] bg-background">
      {/* ─── GAUCHE — produits ────────────────────────────── */}
      <div className="flex min-w-0 flex-col p-6">
        <div className="mb-4 flex gap-2.5">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, DCI, code-barres…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 pr-12 text-[15px]"
            />
            <button title="Scanner code-barres" className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md bg-primary text-white">
              <ScanLine size={16} />
            </button>
          </div>
          <Button variant="outline" size="lg" className="shrink-0">
            <Filter size={14} /> Filtres
          </Button>
          {held.length > 0 ? (
            <Button variant="outline" size="lg" className="shrink-0" onClick={() => setShowHeld(true)}>
              <PlayCircle size={14} /> En attente ({held.length})
            </Button>
          ) : null}
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <CategoryChip label="Tous" color="#64748B" active={cat === "all"} onClick={() => setCat("all")} />
          {categories.map((c) => (
            <CategoryChip key={c.id} label={c.name} color={c.color} active={cat === c.id} onClick={() => setCat(c.id)} />
          ))}
        </div>

        <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 content-start overflow-y-auto pb-3">
          {filteredMedicines.length === 0 ? (
            <div className="col-span-full p-12 text-center text-sm text-muted-foreground">Aucun produit correspondant.</div>
          ) : (
            filteredMedicines.map((m) => (
              <button
                key={m.id}
                onClick={() => addToCart(m)}
                disabled={m.stock === 0}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border bg-card p-3 text-left transition-all",
                  m.stock === 0 ? "cursor-not-allowed opacity-55" : "hover:-translate-y-0.5 hover:border-primary hover:shadow-p-md",
                )}
              >
                <div className="flex items-start justify-between">
                  <MedImage name={m.name} size={48} radius={10} />
                  {m.requiresPrescription ? <Badge variant="warning" className="text-[10px]">Rx</Badge> : null}
                </div>
                <div className="min-h-[36px]">
                  <div className="text-[13px] font-semibold leading-tight">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.form} · {m.laboratory}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-bold">{fmtMoney(m.sellPrice)}</div>
                  <Badge variant={m.stock === 0 ? "destructive" : m.stock <= 20 ? "warning" : "success"} className="text-[10px]">
                    {m.stock === 0 ? "Rupture" : `${m.stock}`}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── DROITE — panier ────────────────────────────── */}
      <div className="sticky top-0 flex h-[calc(100vh-64px)] flex-col border-l bg-card">
        <div className="border-b p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Ticket en cours</div>
              <div className="font-mono text-lg font-bold">Brouillon</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={holdTicket} disabled={!cart.length} title="Mettre en attente">
                <PauseCircle size={14} /> Attente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCart([])} disabled={!cart.length}>
                <Trash2 size={14} /> Vider
              </Button>
            </div>
          </div>

          <button
            onClick={() => (client ? setClient(null) : setShowClientPicker(true))}
            className={cn(
              "mt-3 flex w-full items-center gap-2.5 rounded-md border border-dashed px-3 py-2.5 text-left",
              client ? "border-primary bg-[#E0F2FE]/50 dark:bg-primary/10" : "border-[#CBD5E1] bg-muted/50",
            )}
          >
            {client ? (
              <>
                <Avatar className="h-8 w-8" style={{ background: colorFromString(client.name) }}>
                  <AvatarFallback className="text-[10px]" style={{ background: colorFromString(client.name) }}>{initials(client.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{client.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {client.tier} · {client.points} pts{client.insuranceName ? ` · ${client.insuranceName}` : ""}
                  </div>
                </div>
                <X size={14} className="text-muted-foreground" />
              </>
            ) : (
              <>
                <UserPlus size={16} className="text-muted-foreground" />
                <span className="flex-1 text-[13px] text-muted-foreground">Associer un client</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 inline-block opacity-30"><ShoppingCart size={48} /></div>
              <div className="text-sm font-medium">Panier vide</div>
              <div className="mt-1 text-xs text-muted-foreground">Recherchez ou scannez pour commencer</div>
            </div>
          ) : (
            cart.map((line) => (
              <div key={line.medicineId} className="flex items-center gap-2.5 rounded-lg p-2.5 hover:bg-muted/40">
                <MedImage name={line.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{line.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {fmtMoney(line.price)} × {line.qty} = <strong className="text-foreground">{fmtMoney(line.price * line.qty)}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(line.medicineId, -1)} className="grid h-6 w-6 place-items-center rounded border bg-card hover:bg-muted"><Minus size={11} /></button>
                  <span className="min-w-[22px] text-center text-[13px] font-bold">{line.qty}</span>
                  <button onClick={() => updateQty(line.medicineId, 1)} className="grid h-6 w-6 place-items-center rounded border bg-card hover:bg-muted"><Plus size={11} /></button>
                </div>
                <button onClick={() => removeFromCart(line.medicineId)} className="p-1 text-muted-foreground"><X size={14} /></button>
              </div>
            ))
          )}
        </div>

        <div className="border-t bg-muted/40 p-5">
          <div className="space-y-1.5 text-[13px]">
            <Row label="Sous-total" value={fmtMoney(totals.subtotal)} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Remise</span>
              <div className="flex items-center gap-2">
                <select value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="h-7 rounded border bg-card px-2 text-[11px]">
                  {[0, 5, 10, 15].map((v) => (<option key={v} value={v}>{v}%</option>))}
                </select>
                <span className="font-mono text-[#EF4444]">−{fmtMoney(totals.discountAmount)}</span>
              </div>
            </div>
            <Row label={`TVA ${Math.round(tvaRate * 100)}%`} value={fmtMoney(totals.tax)} />
          </div>
          <div className="my-3 h-px bg-border" />
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm font-bold">TOTAL</span>
            <span className="font-mono text-3xl font-bold tracking-tight">{fmtMoney(totals.total)}</span>
          </div>

          <Button
            size="xl"
            variant={cart.length ? "success" : "secondary"}
            disabled={!cart.length}
            onClick={() => setCheckoutOpen(true)}
            className="w-full"
          >
            <CheckCircle2 size={20} /> ENCAISSER {fmtMoney(totals.total)}
          </Button>

          <div className="mt-3 flex flex-wrap gap-2 rounded-md border bg-card p-2 text-[11px] text-muted-foreground">
            {[["F2", "Vente"], ["F3", "Client"], ["F4", "Attente"], ["F5", "Encaisser"], ["Esc", "Annuler"]].map(([k, l]) => (
              <span key={k} className="flex items-center gap-1"><Kbd>{k}</Kbd> {l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        total={totals.total}
        cart={cart.map((l) => ({ medicineId: l.medicineId, qty: l.qty, requiresPrescription: l.requiresPrescription }))}
        client={client}
        discountPercent={discount}
        role={role}
        locale={locale}
      />

      {/* Client picker */}
      <Dialog open={showClientPicker} onOpenChange={setShowClientPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Choisir un client</DialogTitle></DialogHeader>
          <div className="max-h-[420px] overflow-y-auto">
            {clients.map((c) => (
              <button key={c.id} onClick={() => { setClient(c); setShowClientPicker(false); }} className="flex w-full items-center gap-3 rounded-md p-2.5 text-left hover:bg-muted">
                <Avatar className="h-9 w-9" style={{ background: colorFromString(c.name) }}>
                  <AvatarFallback className="text-xs" style={{ background: colorFromString(c.name) }}>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}{c.insuranceName ? ` · ${c.insuranceName}` : ""}</div>
                </div>
                <Badge variant="neutral" className="text-[10px]">{c.tier}</Badge>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tickets en attente */}
      <Dialog open={showHeld} onOpenChange={setShowHeld}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tickets en attente</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {held.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucun ticket en attente.</p>
            ) : (
              held.map((t) => {
                const tot = t.cart.reduce((s, l) => s + l.price * l.qty, 0);
                return (
                  <button key={t.id} onClick={() => resumeTicket(t)} className="flex w-full items-center justify-between rounded-md border p-3 text-left hover:bg-muted">
                    <div>
                      <div className="text-sm font-medium">{t.client?.name ?? "Client occasionnel"}</div>
                      <div className="text-xs text-muted-foreground">{t.cart.length} article(s) · {fmtMoney(tot)}</div>
                    </div>
                    <PlayCircle size={18} className="text-primary" />
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function CategoryChip({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "white" : color }} />
      {label}
    </button>
  );
}
