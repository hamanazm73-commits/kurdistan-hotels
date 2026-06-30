"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Crown, UserPlus, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useHotels } from "@/lib/use-hotels";
import { OWNER_EMAIL } from "@/lib/firebase";
import {
  listAdmins,
  addAdmin,
  setAdminEnabled,
  removeAdmin,
} from "@/lib/hotels-db";
import type { AdminRecord } from "@/lib/types";

export function AdminsPanel() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { hotels } = useHotels();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "hotel">("admin");
  const [newHotelId, setNewHotelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const refresh = useCallback(() => {
    listAdmins()
      .then(setAdmins)
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(refresh, [refresh]);

  async function onAdd() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) {
      toast.error(t("admin_admin_email"));
      return;
    }
    const hotel = hotels.find((h) => h.id === newHotelId);
    if (newRole === "hotel" && !hotel) {
      toast.error(t("admin_select_hotel"));
      return;
    }
    setAdding(true);
    try {
      await addAdmin(
        e,
        user?.email ?? "owner",
        newRole,
        hotel ? { id: hotel.id, name: hotel.name } : undefined,
      );
      toast.success(t("admin_saved"));
      setEmail("");
      setNewHotelId("");
      refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2 font-semibold">
          <Crown className="size-4 text-gold" />
          {t("admin_you_owner")}
        </div>
        <p className="text-sm text-muted-foreground">{t("admin_owner_only")}</p>
      </Card>

      <Card className="grid gap-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              {t("admin_admin_email")}
            </label>
            <Input
              type="email"
              dir="ltr"
              placeholder="person@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              {t("admin_role")}
            </label>
            <Select
              value={newRole}
              onValueChange={(v) => setNewRole((v as "admin" | "hotel") ?? "admin")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t("role_admin")}</SelectItem>
                <SelectItem value="hotel">{t("role_hotel")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {newRole === "hotel" && (
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              {t("admin_select_hotel")}
            </label>
            <Select value={newHotelId} onValueChange={(v) => setNewHotelId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("admin_select_hotel")} />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={onAdd} disabled={adding} className="sm:w-fit">
          {adding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {t("admin_add_admin")}
        </Button>
      </Card>

      <div className="space-y-2">
        {OWNER_EMAIL && (
          <Card className="flex items-center justify-between gap-3 p-4">
            <span dir="ltr" className="font-medium">
              {OWNER_EMAIL}
            </span>
            <Badge className="gap-1">
              <Crown className="size-3" />
              {t("role_owner")}
            </Badge>
          </Card>
        )}

        {loading ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          admins
            .filter((a) => a.email !== OWNER_EMAIL)
            .map((a) => (
              <Card
                key={a.email}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span dir="ltr" className="font-medium">
                    {a.email}
                  </span>
                  {a.role === "hotel" ? (
                    <Badge variant="outline" className="gap-1">
                      <Building2 className="size-3" />
                      {t("role_hotel")}
                      {a.hotelName ? ` · ${a.hotelName}` : ""}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{t("role_admin")}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    {t("admin_enabled")}
                    <Switch
                      checked={a.enabled}
                      onCheckedChange={async (v) => {
                        try {
                          await setAdminEnabled(a.email, v);
                          refresh();
                        } catch (err) {
                          toast.error((err as Error).message);
                        }
                      }}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        await removeAdmin(a.email);
                        toast.success(t("admin_deleted"));
                        refresh();
                      } catch (err) {
                        toast.error((err as Error).message);
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
