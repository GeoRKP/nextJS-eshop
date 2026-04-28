"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { resetPassword } from "@/lib/actions/password-reset.actions";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      const res = await resetPassword(null, formData);
      setServerMessage(res.message);
      setIsSuccess(res.success);
      if (res.success) {
        setTimeout(() => router.push("/sign-in"), 1500);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center p-8 border border-success/30 bg-success/5 rounded-md">
        <CheckCircle2 className="w-12 h-12 text-success mb-3" />
        <p className="text-foreground font-medium">{serverMessage}</p>
        <p className="text-muted-foreground text-sm mt-2">
          {t("redirectingToSignIn")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">{t("newPassword")}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">{t("passwordMinHint")}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className="pl-10"
          />
        </div>
      </div>
      <Button
        variant="accent"
        size="lg"
        className="w-full"
        type="submit"
        disabled={isPending || !password || !confirmPassword}
      >
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {t("resetPassword")}
      </Button>
      {serverMessage && !isSuccess && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center text-destructive text-sm">
          {serverMessage}
        </div>
      )}
    </form>
  );
}
