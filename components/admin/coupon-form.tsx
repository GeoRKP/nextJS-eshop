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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoupon, updateCoupon } from "@/lib/actions/coupon.actions";
import { insertCouponSchema, createInsertCouponSchema } from "@/lib/validators";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

type CouponFormData = z.infer<typeof insertCouponSchema>;

export default function CouponForm({
  type = "Create",
  coupon,
  couponId,
}: {
  type?: "Create" | "Update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coupon?: any;
  couponId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("AdminCoupons");
  const tV = useTranslations("Validation");

  const localizedSchema = createInsertCouponSchema(tV);
  const form = useForm<CouponFormData>({
    resolver: zodResolver(localizedSchema) as never,
    defaultValues:
      coupon && type === "Update"
        ? {
            code: coupon.code,
            description: coupon.description ?? "",
            discountType: coupon.discountType,
            discountValue: coupon.discountValue?.toString() ?? "0.00",
            minOrderAmount: coupon.minOrderAmount?.toString() ?? null,
            maxDiscount: coupon.maxDiscount?.toString() ?? null,
            maxUses: coupon.maxUses ?? null,
            maxUsesPerUser: coupon.maxUsesPerUser ?? 1,
            validFrom: new Date(coupon.validFrom),
            validUntil: coupon.validUntil
              ? new Date(coupon.validUntil)
              : null,
            isActive: coupon.isActive ?? true,
            appliesToAll: coupon.appliesToAll ?? true,
            categoryIds: [],
            productIds: [],
          }
        : {
            code: "",
            description: "",
            discountType: "percentage" as const,
            discountValue: "0.00",
            minOrderAmount: null,
            maxDiscount: null,
            maxUses: null,
            maxUsesPerUser: 1,
            validFrom: new Date(),
            validUntil: null,
            isActive: true,
            appliesToAll: true,
            categoryIds: [],
            productIds: [],
          },
  });

  const onSubmit = async (values: CouponFormData) => {
    if (type === "Create") {
      const res = await createCoupon(values);
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      } else {
        toast({ description: res.message });
        router.push("/admin/coupons");
      }
    } else if (type === "Update") {
      if (!couponId) {
        router.push("/admin/coupons");
        return;
      }
      const res = await updateCoupon({ ...values, id: couponId });
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      } else {
        toast({ description: res.message });
        router.push("/admin/coupons");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="h2-bold">
          {type === "Create" ? t("createCoupon") : t("updateCoupon")}
        </h1>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("code")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterCode")}
                    {...field}
                    className="font-mono uppercase"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("type")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {t("percentage")}
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      {t("fixedAmount")}
                    </SelectItem>
                    <SelectItem value="free_shipping">
                      {t("freeShipping")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("value")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterValue")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minOrderAmount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("minOrder")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterMinOrder")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || null)
                    }
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
            name="maxDiscount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("maxDiscount")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterMaxDiscount")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("maxUses")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMaxUses")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxUsesPerUser"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("maxUsesPerUser")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMaxUsesPerUser")}
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
            name="validFrom"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("validFrom")}</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(new Date(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("validUntil")}</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("enterDescription")}
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 p-4 rounded-lg border border-border/60 bg-muted/20">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>{t("isActive")}</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appliesToAll"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 p-4 rounded-lg border border-border/60 bg-muted/20">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>{t("appliesToAll")}</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : type === "Create" ? (
            t("createButton")
          ) : (
            t("updateButton")
          )}
        </Button>
      </form>
    </Form>
  );
}
