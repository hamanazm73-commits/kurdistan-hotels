"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

/**
 * Logout button with a styled confirmation dialog (replaces window.confirm).
 * Pass the trigger button so it can match each placement's look.
 */
export function LogoutButton({ trigger }: { trigger: React.ReactElement }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <LogOut className="size-6" />
          </div>
          <DialogTitle className="text-center">{t("logout_confirm")}</DialogTitle>
          {user?.email && (
            <DialogDescription className="text-center" dir="ltr">
              {user.email}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("admin_cancel")}
          </Button>
          <Button
            variant="destructive"
            className="gap-1.5"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="size-4" />
            {t("nav_logout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
