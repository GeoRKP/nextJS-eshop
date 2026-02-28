"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateUserProfileSchema, createUpdateUserProfileSchema } from "@/lib/validators";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/shared/form-input";
import { updateProfile } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Mail, User, Loader2 } from "lucide-react";

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const t = useTranslations("UserProfile");
  const tCommon = useTranslations("Common");
  const tV = useTranslations("Validation");

  const form = useForm<z.infer<typeof updateUserProfileSchema>>({
    resolver: zodResolver(createUpdateUserProfileSchema(tV)),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof updateUserProfileSchema>) => {
    const res = await updateProfile(values);

    if (!res.success) {
      return toast({
        description: res.message,
        variant: "destructive",
      });
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      },
    };

    update(newSession);

    toast({
      description: res.message,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("email")}</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <div className="h-10 rounded-md border border-border/60 bg-muted/30 px-3 pl-10 flex items-center text-sm text-muted-foreground">
                  {field.value}
                </div>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem className="w-full">
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={User}
                  placeholder={t("namePlaceholder")}
                  error={fieldState.error?.message}
                  isValid={fieldState.isDirty && !fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {form.formState.isSubmitting ? tCommon("submitting") : t("updateProfile")}
        </Button>
      </form>
    </Form>
  );
}
