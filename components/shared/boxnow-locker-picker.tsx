"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBoxNowLockers } from "@/lib/actions/boxnow.actions";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Search, Check, PackageOpen } from "lucide-react";
import type { BoxNowLocker } from "@/lib/boxnow";

export default function BoxNowLockerPicker({
  value,
  onSelect,
}: {
  value?: BoxNowLocker | null;
  onSelect: (locker: BoxNowLocker) => void;
}) {
  const t = useTranslations("Checkout");
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [lockers, setLockers] = useState<BoxNowLocker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    startTransition(async () => {
      setError(null);
      const res = await getBoxNowLockers();
      if (!res.success || !res.data) {
        setError(res.error || t("lockerLoadError"));
        setLockers([]);
        setLoaded(true);
        return;
      }
      setLockers(res.data);
      setLoaded(true);
    });
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? lockers.filter((l) =>
        [l.name, l.addressLine1, l.city, l.postalCode]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      )
    : lockers;

  return (
    <div className="space-y-3">
      {value?.id && (
        <div className="flex items-start gap-2 rounded-lg border border-brand-accent/40 bg-brand-accent/5 p-3">
          <MapPin className="w-4 h-4 mt-0.5 text-brand-accent shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">{value.name}</div>
            <div className="text-muted-foreground">
              {[value.addressLine1, value.postalCode, value.city]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </div>
      )}

      {!loaded ? (
        <Button
          type="button"
          variant="outline"
          onClick={load}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <PackageOpen className="w-4 h-4 mr-2" />
          )}
          {t("loadLockers")}
        </Button>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchLockerPlaceholder")}
              className="pl-9"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!error && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {filtered.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  {t("noLockersFound")}
                </p>
              ) : (
                filtered.map((l) => {
                  const isActive = value?.id === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onSelect(l)}
                      className={cn(
                        "w-full text-left p-3 text-sm hover:bg-muted/50 transition-colors flex items-start gap-2",
                        isActive && "bg-brand-accent/5"
                      )}
                    >
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="flex-1">
                        <span className="font-medium block">{l.name}</span>
                        <span className="text-muted-foreground">
                          {[l.addressLine1, l.postalCode, l.city]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-brand-accent shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
