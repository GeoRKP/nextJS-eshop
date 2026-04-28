"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset } from "@/lib/actions/password-reset.actions";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      const res = await requestPasswordReset(null, formData);
      setServerMessage(res.message);
      setIsSuccess(res.success);
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center p-8 border border-success/30 bg-success/5 rounded-md">
          <CheckCircle2 className="w-12 h-12 text-success mb-3" />
          <p className="text-foreground font-medium">{serverMessage}</p>
        </div>
        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {t("backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="pl-10"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <Button
        variant="accent"
        size="lg"
        className="w-full"
        type="submit"
        disabled={isPending || !email}
      >
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {t("sendResetLink")}
      </Button>
      {serverMessage && !isSuccess && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center text-destructive text-sm">
          {serverMessage}
        </div>
      )}
      <div className="text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t("backToSignIn")}
        </Link>
      </div>
    </form>
  );
}
