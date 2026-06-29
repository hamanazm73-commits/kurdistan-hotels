"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Crown, UserPlus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
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
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [email, setEmail] = useState("");
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
    setAdding(true);
    try {
      await addAdmin(e, user?.email ?? "owner");
      toast.success(t("admin_saved"));
      setEmail("");
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

      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-muted-foreground">
            {t("admin_admin_email")}
          </label>
          <Input
            type="email"
            dir="ltr"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
          />
        </div>
        <Button onClick={onAdd} disabled={adding}>
          {adding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {t("admin_add_admin")}
        </Button>
      </Card>

      <div className="space-y-2">
        {/* owner row (from env) */}
        {OWNER_EMAIL && (
          <Card className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              <span dir="ltr" className="font-medium">
                {OWNER_EMAIL}
              </span>
              <Badge className="gap-1">
                <Crown className="size-3" />
                {t("role_owner")}
              </Badge>
            </div>
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
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-2">
                  <span dir="ltr" className="font-medium">
                    {a.email}
                  </span>
                  <Badge variant="secondary">{t("role_admin")}</Badge>
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
