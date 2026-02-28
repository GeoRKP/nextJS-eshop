"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { paymentMethodSchema, createPaymentMethodSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader2, ArrowRight, CreditCard, Wallet, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS } from "@/lib/constants";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const DEFAULT_PAYMENT_METHOD = "card";

const paymentIcons: Record<string, typeof CreditCard> = {
  Stripe: CreditCard,
  PayPal: Wallet,
  CashOnDelivery: Banknote,
};

const paymentDescKeys: Record<string, string> = {
  Stripe: "payWithCard",
  PayPal: "payWithPaypal",
  CashOnDelivery: "payOnDelivery",
};

export default function PaymentMethodForm({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Checkout");
  const tV = useTranslations("Validation");

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(createPaymentMethodSchema(tV)),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });

  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      router.push("/place-order");
    });
  };

  return (
    <div className="wrapper-narrow">
      <div className="card-premium p-6 md:p-8 max-w-2xl mx-auto">
        <h1 className="h2-bold mb-2">{t("paymentMethod")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("paymentMethodDescription")}
        </p>
        <Form {...form}>
          <form
            method="post"
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid gap-3">
                      {PAYMENT_METHODS.map((paymentMethod) => {
                        const Icon = paymentIcons[paymentMethod] || CreditCard;
                        const isSelected = field.value === paymentMethod;

                        return (
                          <button
                            type="button"
                            key={paymentMethod}
                            onClick={() => field.onChange(paymentMethod)}
                            className={cn(
                              "relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left",
                              isSelected
                                ? "border-brand-accent bg-brand-accent/5 shadow-card-glow"
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center",
                              isSelected ? "bg-brand-accent/10 text-brand-accent" : "bg-muted text-muted-foreground"
                            )}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{paymentMethod}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t(paymentDescKeys[paymentMethod] as Parameters<typeof t>[0])}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-brand-accent text-white flex items-center justify-center">
                                <Check className="w-4 h-4" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {t("continueToReview")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
