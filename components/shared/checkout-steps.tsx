"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

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

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-full font-semibold text-sm",
                    "w-10 h-10 md:w-12 md:h-12",
                    isCompleted &&
                      "bg-green-600 text-white",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground"
                  )}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                    >
                      <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span className="text-sm md:text-base">{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    "hidden sm:block text-xs md:text-sm text-center whitespace-nowrap",
                    isCompleted && "text-green-600 font-medium",
                    isCurrent && "text-primary font-semibold",
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
                <div className="flex-1 mx-2 md:mx-4 h-1 rounded-full bg-muted overflow-hidden self-start mt-5 md:mt-6">
                  <motion.div
                    className="h-full rounded-full bg-green-600"
                    initial={{ width: 0 }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
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
