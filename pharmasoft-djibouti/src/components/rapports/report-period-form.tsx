"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Insurance {
  id: string;
  name: string;
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function isoMonthAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

// PHARMASOFT — Carte de paramétrage période + bouton télécharger pour les rapports
// qui acceptent une plage de dates (sales export, insurance batch).
export function PeriodReportCard({
  title,
  description,
  endpoint,
  insurances,
}: {
  title: string;
  description: string;
  endpoint: "sales" | "insurance";
  insurances?: Insurance[];
}) {
  const [from, setFrom] = useState(isoMonthAgo());
  const [to, setTo] = useState(isoToday());
  const [insId, setInsId] = useState(insurances?.[0]?.id ?? "");

  const url =
    endpoint === "sales"
      ? `/api/reports/sales?from=${from}&to=${to}`
      : insId
        ? `/api/reports/insurance/${insId}?from=${from}&to=${to}`
        : "#";

  return (
    <Card className="p-5">
      <h3 className="t-h4 mb-1">{title}</h3>
      <p className="t-muted mb-4 text-sm">{description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block">Du</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block">Au</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {endpoint === "insurance" && insurances ? (
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">Assureur</Label>
            <select
              value={insId}
              onChange={(e) => setInsId(e.target.value)}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {insurances.map((ins) => (
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <Button asChild>
          <Link href={url} target="_blank">
            <Download size={14} /> Télécharger
          </Link>
        </Button>
      </div>
    </Card>
  );
}
