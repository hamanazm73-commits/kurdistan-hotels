"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Phone,
  Trash2,
  RefreshCw,
  Search,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { CITIES } from "@/lib/sample-data";
import { listLeads, addLead, updateLead, deleteLead } from "@/lib/hotels-db";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "interested",
  "listed",
  "declined",
];

/** Colour per stage, so the pipeline reads at a glance. */
const TONE: Record<LeadStatus, string> = {
  new: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  contacted: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  interested: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  listed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  declined: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function waUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const n = digits.startsWith("0") ? "964" + digits.slice(1) : digits;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

/**
 * The sales pipeline: which hotels to approach, who has been spoken to, and
 * what they said. Visiting hotels door to door doesn't scale on its own —
 * without a record there's no way to know who is still owed a follow-up.
 */
export function LeadsPanel() {
  const { t, tCity } = useI18n();
  const [items, setItems] = useState<(Lead & { id: string })[]>([]);
  const [misses, setMisses] = useState<{ term: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);

  // add form
  const [name, setName] = useState("");
  const [city, setCity] = useState<string>(CITIES[0] as string);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await listLeads();
      setItems(d.items);
      setMisses(d.misses);
    } catch {
      toast.error(t("lead_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(prefillName?: string) {
    const hotelName = (prefillName ?? name).trim();
    if (!hotelName) {
      toast.error(t("lead_name_required"));
      return;
    }
    setAdding(true);
    try {
      await addLead({
        hotelName,
        city,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setName("");
      setPhone("");
      setNote("");
      await load();
      toast.success(t("lead_added"));
    } catch {
      toast.error(t("lead_save_failed"));
    } finally {
      setAdding(false);
    }
  }

  async function move(id: string, status: LeadStatus) {
    setBusy(id);
    try {
      await updateLead(id, { status });
      setItems((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l)),
      );
    } catch {
      toast.error(t("lead_save_failed"));
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteLead(id);
      setItems((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error(t("lead_save_failed"));
    } finally {
      setBusy(null);
    }
  }

  const counts = STATUSES.map((s) => ({
    s,
    n: items.filter((l) => l.status === s).length,
  }));
  const shown = filter === "all" ? items : items.filter((l) => l.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("admin_leads")}</h2>
        <Button variant="outline" onClick={load} className="gap-1.5">
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          {t("lead_refresh")}
        </Button>
      </div>

      {/* pipeline counts double as the filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-semibold transition",
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {t("filter_all")} · {items.length}
        </button>
        {counts.map(({ s, n }) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold transition",
              filter === s ? "ring-2 ring-primary" : "",
              TONE[s],
            )}
          >
            {t(`lead_${s}`)} · {n}
          </button>
        ))}
      </div>

      {/* what people searched for and we couldn't show — the best lead list */}
      {misses.length > 0 && (
        <Card className="p-4">
          <p className="flex items-center gap-2 font-semibold">
            <Search className="size-4 text-gold" />
            {t("lead_misses")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("lead_misses_hint")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {misses.map((m) => (
              <button
                key={m.term}
                type="button"
                disabled={adding}
                onClick={() => create(m.term)}
                title={t("lead_add_from_search")}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/5 px-3 py-1 text-sm transition hover:bg-gold/15"
              >
                <Plus className="size-3.5" />
                {m.term}
                <span className="text-xs text-muted-foreground">{m.count}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* add a hotel to visit */}
      <Card className="p-4">
        <p className="font-semibold">{t("lead_add_title")}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="ld-name">{t("lead_hotel")}</Label>
            <Input
              id="ld-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label>{t("lead_city")}</Label>
            <Select value={city} onValueChange={(v) => v && setCity(v)}>
              <SelectTrigger>
                <SelectValue>{(v: string | null) => tCity(v ?? city)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {tCity(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="ld-phone">{t("lead_phone")}</Label>
            <Input
              id="ld-phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="ld-note">{t("lead_note")}</Label>
            <Input
              id="ld-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => create()} disabled={adding} className="mt-3 gap-1.5">
          {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t("lead_add")}
        </Button>
      </Card>

      {loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("lead_none")}</p>
      ) : (
        <div className="space-y-2">
          {shown.map((l) => (
            <Card key={l.id} className="p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{l.hotelName}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    {l.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {tCity(l.city)}
                      </span>
                    )}
                    {l.phone && <span dir="ltr">{l.phone}</span>}
                  </p>
                  {l.note && (
                    <p className="mt-1 text-sm text-muted-foreground">{l.note}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {l.phone && (
                    <>
                      <a
                        href={`tel:${l.phone}`}
                        title={t("call_cta")}
                        className="inline-flex size-9 items-center justify-center rounded-lg border text-primary transition hover:bg-muted"
                      >
                        <Phone className="size-4" />
                      </a>
                      <a
                        href={waUrl(l.phone, t("lead_wa_intro"))}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-[#25D366] text-white transition hover:bg-[#1ebe5d]"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </a>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground hover:text-destructive"
                    title={t("admin_delete")}
                    disabled={busy === l.id}
                    onClick={() => remove(l.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy === l.id}
                    onClick={() => move(l.id, s)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold transition disabled:opacity-50",
                      l.status === s
                        ? TONE[s] + " ring-2 ring-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    {t(`lead_${s}`)}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
