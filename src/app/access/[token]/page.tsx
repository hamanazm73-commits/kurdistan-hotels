"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Loader2, TriangleAlert } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useI18n } from "@/lib/i18n";

export default function AccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against double-invoke in dev
    ran.current = true;
    (async () => {
      try {
        const res = await fetch("/api/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error("bad_link");
        const { email, password } = (await res.json()) as {
          email: string;
          password: string;
        };
        if (!auth) throw new Error("no_auth");
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/hq");
      } catch {
        setFailed(true);
      }
    })();
  }, [token, router]);

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-primary">
        <div className="aurora-blob absolute -top-32 -start-24 size-[28rem] rounded-full bg-primary-foreground/10" />
        <div className="aurora-blob absolute bottom-0 end-0 size-[26rem] rounded-full bg-gold/30 [animation-delay:-5s]" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-card/95 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Building2 className="size-7" />
        </div>

        {!failed ? (
          <>
            <h1 className="mt-4 text-xl font-bold">{t("access_signing_in")}</h1>
            <Loader2 className="mx-auto mt-5 size-6 animate-spin text-muted-foreground" />
          </>
        ) : (
          <>
            <div className="mx-auto mt-4 flex items-center justify-center gap-2 text-destructive">
              <TriangleAlert className="size-5" />
              <h1 className="text-lg font-bold">{t("access_failed")}</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("access_failed_hint")}
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {t("login_back")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
