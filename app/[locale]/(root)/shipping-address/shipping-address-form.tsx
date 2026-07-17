"use client";

import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useRef, useTransition } from "react";
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
import { ArrowRight, Loader2, User, MapPin, Building2, Hash, Globe, Phone, Home, PackageOpen } from "lucide-react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import { useTranslations } from "next-intl";
import BoxNowLockerPicker from "@/components/shared/boxnow-locker-picker";
import type { BoxNowLocker } from "@/lib/boxnow";
import { cn } from "@/lib/utils";

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

  const shippingMethod = form.watch("shippingMethod") || "home";
  const selectedLocker = form.watch("boxnowLocker");

  // Snapshot of the home-delivery fields taken before locker autofill overwrites
  // them, so switching back to "home" can't submit the locker's address/postal code.
  const homeAddressRef = useRef<Partial<ShippingAddress> | null>(null);

  const setMethod = (method: "home" | "boxnow_locker") => {
    if (method === "boxnow_locker" && shippingMethod !== "boxnow_locker") {
      homeAddressRef.current = {
        address: form.getValues("address"),
        city: form.getValues("city"),
        postalCode: form.getValues("postalCode"),
        country: form.getValues("country"),
        lat: form.getValues("lat"),
        lng: form.getValues("lng"),
      };
    }
    if (method === "home") {
      form.setValue("boxnowLocker", null);
      const snap = homeAddressRef.current;
      if (snap) {
        form.setValue("address", snap.address ?? "");
        form.setValue("city", snap.city ?? "");
        form.setValue("postalCode", snap.postalCode ?? "");
        form.setValue("country", snap.country ?? "");
        form.setValue("lat", snap.lat);
        form.setValue("lng", snap.lng);
        homeAddressRef.current = null;
      }
    }
    form.setValue("shippingMethod", method, { shouldDirty: true });
  };

  const handleLockerSelect = (locker: BoxNowLocker) => {
    form.setValue("boxnowLocker", locker, { shouldValidate: true });
    // Auto-fill the address fields from the locker so the shared schema still validates
    // and the order keeps a meaningful shipping address.
    const country =
      locker.country && locker.country.length >= 3 ? locker.country : "Greece";
    form.setValue("address", locker.addressLine1 || locker.name, { shouldValidate: true });
    form.setValue("city", locker.city || locker.name, { shouldValidate: true });
    form.setValue("postalCode", locker.postalCode || "00000", { shouldValidate: true });
    form.setValue("country", country, { shouldValidate: true });
    if (typeof locker.lat === "number") form.setValue("lat", locker.lat);
    if (typeof locker.lng === "number") form.setValue("lng", locker.lng);
  };

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
            className="space-y-3 md:space-y-5"
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
            {/* Shipping method toggle */}
            <div>
              <FormLabel className="mb-2 block">{t("shippingMethod")}</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("home")}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-sm font-medium transition-all text-left",
                    shippingMethod === "home"
                      ? "border-brand-accent bg-brand-accent/5 ring-2 ring-brand-accent/20"
                      : "border-border hover:border-brand-accent/40"
                  )}
                >
                  <Home className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    {t("shippingMethodHome")}
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      {t("shippingMethodHomeTagline")}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("boxnow_locker")}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-sm font-medium transition-all text-left",
                    shippingMethod === "boxnow_locker"
                      ? "border-brand-accent bg-brand-accent/5 ring-2 ring-brand-accent/20"
                      : "border-border hover:border-brand-accent/40"
                  )}
                >
                  <PackageOpen className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    {t("shippingMethodLocker")}
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      {t("shippingMethodLockerTagline")}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Phone (required for Box Now locker PIN SMS) */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("phone")}
                    {shippingMethod === "boxnow_locker" && " *"}
                  </FormLabel>
                  <FormControl>
                    <FormInput
                      icon={Phone}
                      placeholder={t("enterPhone")}
                      error={fieldState.error?.message}
                      isValid={fieldState.isDirty && !fieldState.error}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {shippingMethod === "home" && (
              <>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
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
              </>
            )}

            {shippingMethod === "boxnow_locker" && (
              <div>
                <FormLabel className="mb-2 block">{t("selectLocker")}</FormLabel>
                <BoxNowLockerPicker
                  value={selectedLocker as BoxNowLocker | null}
                  onSelect={handleLockerSelect}
                />
                {form.formState.errors.boxnowLocker && (
                  <p className="mt-2 text-sm text-destructive">
                    {String(form.formState.errors.boxnowLocker.message)}
                  </p>
                )}
              </div>
            )}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all"
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
