"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { continueAsGuest } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/form-input";
import { Mail, Loader2 } from "lucide-react";

export default function GuestCheckoutForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("callbackUrl", callbackUrl);
      const res = await continueAsGuest(null, formData);
      if (res && !res.success) {
        setError(res.message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="guest-email" className="text-sm font-medium">
          {t("email")}
        </label>
        <FormInput
          id="guest-email"
          icon={Mail}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t("guestDescription")}</p>
      </div>
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {t("guestContinue")}
      </Button>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center text-destructive text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
