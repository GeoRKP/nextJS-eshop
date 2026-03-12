"use client";

import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/shared/form-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createAddress, updateAddress } from "@/lib/actions/address.actions";
import { createInsertAddressSchema } from "@/lib/validators";
import { useTranslations } from "next-intl";
import { Address } from "@/types";
import {
  Tag,
  User,
  Phone,
  MapPin,
  Building2,
  Flag,
  Hash,
  Loader2,
} from "lucide-react";

export default function AddressForm({
  type = "Create",
  address,
  addressId,
}: {
  type?: "Create" | "Update";
  address?: Address;
  addressId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("AddressBook");
  const tCommon = useTranslations("Common");
  const tV = useTranslations("Validation");

  const schema = createInsertAddressSchema(tV);
  type FormValues = z.input<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues:
      address && type === "Update"
        ? {
            label: address.label ?? "",
            fullName: address.fullName,
            phone: address.phone ?? "",
            address: address.address,
            address2: address.address2 ?? "",
            city: address.city,
            state: address.state ?? "",
            postalCode: address.postalCode,
            country: address.country,
            lat: address.lat ?? null,
            lng: address.lng ?? null,
            isDefault: address.isDefault ?? false,
          }
        : {
            label: "",
            fullName: "",
            phone: "",
            address: "",
            address2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            lat: null,
            lng: null,
            isDefault: false,
          },
  });

  const onSubmit = async (values: FormValues) => {
    const data = {
      ...values,
      isDefault: values.isDefault ?? false,
    };
    if (type === "Create") {
      const res = await createAddress(data);
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      } else {
        toast({ description: res.message });
        router.push("/user/addresses");
      }
    } else if (type === "Update") {
      if (!addressId) {
        router.push("/user/addresses");
        return;
      }
      const res = await updateAddress({ ...data, id: addressId });
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      } else {
        toast({ description: res.message });
        router.push("/user/addresses");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="h2-bold">
          {type === "Create" ? t("addAddress") : t("editAddress")}
        </h1>

        <FormField
          control={form.control}
          name="label"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("label")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={Tag}
                  placeholder={t("enterLabel")}
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <FormInput
                    icon={Phone}
                    placeholder={t("enterPhone")}
                    type="tel"
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
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <FormItem>
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

        <FormField
          control={form.control}
          name="address2"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("address2")}</FormLabel>
              <FormControl>
                <FormInput
                  icon={Building2}
                  placeholder={t("enterAddress2")}
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
          <FormField
            control={form.control}
            name="state"
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormLabel>{t("state")}</FormLabel>
                <FormControl>
                  <FormInput
                    icon={Flag}
                    placeholder={t("enterState")}
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
          <FormField
            control={form.control}
            name="country"
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormLabel>{t("country")}</FormLabel>
                <FormControl>
                  <FormInput
                    icon={Flag}
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

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-lg border border-border/60 bg-muted/20">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("isDefault")}</FormLabel>
                <p className="text-xs text-muted-foreground">
                  {t("isDefaultDescription")}
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {form.formState.isSubmitting
            ? tCommon("submitting")
            : type === "Create"
              ? t("createButton")
              : t("updateButton")}
        </Button>
      </form>
    </Form>
  );
}
