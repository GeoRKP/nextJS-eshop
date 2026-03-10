"use client";

import { Button } from "@/components/ui/button";
import { signUpDefaultValues } from "@/lib/constants";
import { Link } from "@/i18n/navigation";
import { signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";
import { Loader2, User, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignUpFormSchema } from "@/lib/validators";
import { z } from "zod";
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

export default function SignUpForm() {
  const t = useTranslations("Auth");
  const tV = useTranslations("Validation");

  const schema = createSignUpFormSchema(tV);
  type SignUpFormValues = z.infer<typeof schema>;

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: signUpDefaultValues,
  });

  const onSubmit = (values: SignUpFormValues) => {
    setServerError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("callbackUrl", callbackUrl);

      const res = await signUpUser(null, formData);
      if (res && !res.success) {
        setServerError(res.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={User}
                  type="text"
                  autoComplete="name"
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
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={Lock}
                  type="password"
                  autoComplete="new-password"
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
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("confirmPassword")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={Lock}
                  type="password"
                  autoComplete="new-password"
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
            {t("signUp")}
          </Button>
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center text-destructive text-sm mt-2">
              {serverError}
            </div>
          )}
          <div className="text-sm text-center text-muted-foreground mt-2">
            {t("hasAccount")}{" "}
            <Link href="/sign-in" className="text-accent font-semibold hover:underline inline-block px-1 py-1">
              {t("signIn")}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
