"use client";

import { Button } from "@/components/ui/button";
import { signInDefaultValues } from "@/lib/constants";
import { Link } from "@/i18n/navigation";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignInFormSchema } from "@/lib/validators";
import { z } from "zod/v3";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/shared/form-input";
import { useState, useTransition } from "react";

export default function CredentialsSignInForm() {
  const t = useTranslations("Auth");
  const tV = useTranslations("Validation");

  const schema = createSignInFormSchema(tV);
  type SignInFormValues = z.infer<typeof schema>;

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: signInDefaultValues,
  });

  const onSubmit = async (values: SignInFormValues) => {
    setServerError("");
    let res: { success: boolean; message: string } | undefined;
    await new Promise<void>((resolve) => {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("callbackUrl", callbackUrl);

        res = await signInWithCredentials(null, formData);
        resolve();
      });
    });
    if (res && !res.success) {
      setServerError(res.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  error={fieldState.error?.message}
                  isValid={fieldState.isDirty && !fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("password")}</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <FormControl>
                <FormInput
                  icon={Lock}
                  type="password"
                  autoComplete="current-password"
                  error={fieldState.error?.message}
                  isValid={fieldState.isDirty && !fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button variant="accent" size="lg" className="w-full" type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {t("signIn")}
          </Button>
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center text-destructive text-sm mt-2">
              {serverError}
            </div>
          )}
          <div className="text-sm text-center text-muted-foreground mt-2">
            {t("noAccount")}{" "}
            <Link
              href={
                callbackUrl !== "/"
                  ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/sign-up"
              }
              className="text-accent font-semibold hover:underline inline-block px-1 py-1"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
