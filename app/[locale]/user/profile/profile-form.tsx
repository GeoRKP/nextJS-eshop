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
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { updateProfile } from "@/lib/actions/user.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    disabled={true}
                    placeholder={t("email")}
                    className="input-field "
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("name")}
                    className="input-field "
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" size='lg' className="button col-span-2 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? tCommon('submitting') : t('updateProfile')}
        </Button>
      </form>
    </Form>
  );
}
