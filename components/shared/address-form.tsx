"use client";

import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createAddress, updateAddress } from "@/lib/actions/address.actions";
import { insertAddressSchema } from "@/lib/validators";
import { useTranslations } from "next-intl";
import { Address } from "@/types";

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

  type FormValues = z.input<typeof insertAddressSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(insertAddressSchema) as never,
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterLabel")}
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
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("fullName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterFullName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterPhone")}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("address")}</FormLabel>
              <FormControl>
                <Input placeholder={t("enterAddress")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("address2")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterAddress2")}
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
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("city")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterCity")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("state")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterState")}
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
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("postalCode")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterPostalCode")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("country")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterCountry")} {...field} />
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
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{t("isDefault")}</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button w-full"
        >
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
