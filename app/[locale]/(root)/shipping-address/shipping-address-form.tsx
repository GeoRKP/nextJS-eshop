"use client";

import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { createShippingAddressSchema } from "@/lib/validators";
import { ShippingAddress } from "@/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressDefaultValues } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/shared/form-input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, User, MapPin, Building2, Hash, Globe } from "lucide-react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import { useTranslations } from "next-intl";

export default function ShippingAddressForm({
  address,
}: {
  address: ShippingAddress;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Checkout");
  const tCommon = useTranslations("Common");
  const tV = useTranslations("Validation");

  const form = useForm<ShippingAddress>({
    resolver: zodResolver(createShippingAddressSchema(tV)),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<ShippingAddress> = async (values) => {
    startTransition(async () => {
      const res = await updateUserAddress(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      router.push("/payment-method");
    });
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">{t("shippingAddress")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("shippingAddressDescription")}
        </p>
        <Form {...form}>
          <form
            method="post"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("fullName")}</FormLabel>
                    <FormControl>
                      <FormInput
                        icon={User}
                        placeholder={t("enterFullName")}
                        error={fieldState.error?.message}
                        isValid={fieldState.isDirty && !fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("address")}</FormLabel>
                    <FormControl>
                      <FormInput
                        icon={MapPin}
                        placeholder={t("enterAddress")}
                        error={fieldState.error?.message}
                        isValid={fieldState.isDirty && !fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("city")}</FormLabel>
                    <FormControl>
                      <FormInput
                        icon={Building2}
                        placeholder={t("enterCity")}
                        error={fieldState.error?.message}
                        isValid={fieldState.isDirty && !fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("postalCode")}</FormLabel>
                    <FormControl>
                      <FormInput
                        icon={Hash}
                        placeholder={t("enterPostalCode")}
                        error={fieldState.error?.message}
                        isValid={fieldState.isDirty && !fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="country"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("country")}</FormLabel>
                    <FormControl>
                      <FormInput
                        icon={Globe}
                        placeholder={t("enterCountry")}
                        error={fieldState.error?.message}
                        isValid={fieldState.isDirty && !fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
                {tCommon("continue")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
