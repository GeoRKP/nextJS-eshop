"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "avl_cookie_consent_v1";

export default function CookieConsent() {
  const t = useTranslations("CookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Slight delay so banner doesn't flash on first paint
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accepted: true, timestamp: Date.now() })
    );
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accepted: false, timestamp: Date.now() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 md:bottom-4 md:inset-x-auto md:right-4 md:max-w-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      role="dialog"
      aria-labelledby="cookie-consent-title"
    >
      <div className="bg-card border-t border-border md:border md:shadow-elevated p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="hidden md:block flex-shrink-0 h-9 w-9 bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Cookie className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <h3
                id="cookie-consent-title"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent"
              >
                ▲ {t("title")}
              </h3>
              <button
                onClick={reject}
                aria-label={t("close")}
                className="md:hidden text-muted-foreground hover:text-foreground -mt-1 -mr-1 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {t("body")}{" "}
              <Link
                href="/cookies"
                className="text-accent hover:underline whitespace-nowrap"
              >
                {t("learnMore")}
              </Link>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={reject}
                className="flex-1"
              >
                {t("reject")}
              </Button>
              <Button
                size="sm"
                variant="accent"
                onClick={accept}
                className="flex-1"
              >
                {t("accept")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
