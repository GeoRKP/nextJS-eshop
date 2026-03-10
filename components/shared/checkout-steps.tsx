"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, User, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

const stepIcons = [User, MapPin, CreditCard, ShoppingBag];

export default function CheckoutSteps({ current = 0 }: { current: number }) {
  const t = useTranslations("Checkout");

  const steps = [
    t("userLogin"),
    t("shippingAddress"),
    t("paymentMethod"),
    t("placeOrder"),
  ];

  return (
    <div className="mb-10 flex items-center justify-center">
      <div className="flex items-center w-full max-w-2xl">
        {steps.map((step, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current;
          const Icon = stepIcons[index];

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-full font-semibold text-sm",
                    "w-10 h-10 md:w-12 md:h-12",
                    isCompleted &&
                      "bg-brand-accent text-accent-foreground shadow-card",
                    isCurrent &&
                      "bg-brand-accent text-accent-foreground ring-4 ring-brand-accent/20 shadow-card",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground border-2 border-border"
                  )}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap",
                    isCompleted && "text-brand-accent font-medium",
                    isCurrent && "text-brand-accent font-semibold",
                    !isCompleted &&
                      !isCurrent &&
                      "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 md:mx-4 h-0.5 rounded-full bg-muted overflow-hidden self-start mt-5 md:mt-6">
                  <motion.div
                    className="h-full rounded-full bg-brand-accent"
                    initial={{ width: 0 }}
                    animate={{
                      width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
