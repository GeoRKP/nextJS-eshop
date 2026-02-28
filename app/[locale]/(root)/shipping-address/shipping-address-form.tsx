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
    <div className="wrapper-narrow">
      <div className="card-premium p-6 md:p-8 max-w-2xl mx-auto">
        <h1 className="h2-bold mb-2">{t("shippingAddress")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("shippingAddressDescription")}
        </p>
        <Form {...form}>
          <form
            method="post"
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold text-base"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {t("continueToPayment")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
