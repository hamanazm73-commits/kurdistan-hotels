"use client";

import { useEffect, useState } from "react";
import { Loader2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n";
import { listBookings } from "@/lib/hotels-db";
import type { Booking } from "@/lib/types";

export function BookingsPanel() {
  const { t } = useI18n();
  const [rows, setRows] = useState<(Booking & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBookings()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (rows.length === 0)
    return (
      <Card className="grid place-items-center gap-2 py-16 text-muted-foreground">
        <Inbox className="size-8" />
        <p>{t("admin_bookings")} — 0</p>
      </Card>
    );

  return (
    <Card className="overflow-hidden p-0">
      <Table className="[&_tbody_tr:nth-child(even)]:bg-muted/30">
        <TableHeader>
          <TableRow>
            <TableHead>{t("book_hotel")}</TableHead>
            <TableHead>{t("book_name")}</TableHead>
            <TableHead>{t("book_phone")}</TableHead>
            <TableHead>{t("book_roomtype")}</TableHead>
            <TableHead>{t("book_checkin")}</TableHead>
            <TableHead>{t("book_nights")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">{b.hotel}</TableCell>
              <TableCell>{b.name}</TableCell>
              <TableCell>
                <span dir="ltr">{b.phone}</span>
              </TableCell>
              <TableCell>{b.roomType}</TableCell>
              <TableCell>
                <span dir="ltr">{b.checkIn}</span>
              </TableCell>
              <TableCell>{b.nights}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
