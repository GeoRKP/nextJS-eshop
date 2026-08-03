"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { subscribeToNewsletter } from "@/lib/actions/newsletter.actions";

type Variant = "footer" | "footer-cta" | "default";

function SubmitButton({
  variant,
  label,
  className,
}: {
  variant: Variant;
  label: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      size={variant === "default" ? "icon" : undefined}
      className={className}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {variant === "footer-cta" && <span className="ml-2">{label}</span>}
    </Button>
  );
}

export default function NewsletterForm({ variant = "default" }: { variant?: Variant }) {
  const t = useTranslations("Footer");
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(subscribeToNewsletter, null);

  useEffect(() => {
    if (!state) return;
    toast({
      variant: state.success ? undefined : "destructive",
      description: state.message,
    });
    if (state.success) formRef.current?.reset();
  }, [state, toast]);

  const emailInput = (className: string) => (
    <Input
      type="email"
      name="email"
      required
      autoComplete="email"
      aria-label={t("emailPlaceholder")}
      placeholder={t("emailPlaceholder")}
      className={className}
    />
  );

  if (variant === "footer-cta") {
    return (
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col sm:flex-row gap-px"
      >
        <input type="hidden" name="source" value="footer-cta" />
        {emailInput(
          "flex-1 h-12 rounded-none border-2 border-background/25 bg-background/5 text-background placeholder:text-background/55 focus-visible:ring-0 focus-visible:border-accent text-sm font-mono"
        )}
        <SubmitButton
          variant={variant}
          label={t("subscribe")}
          className="h-12 rounded-none bg-accent hover:bg-background text-accent-foreground hover:text-foreground px-6 font-heading font-bold uppercase tracking-[0.16em] btn-stamp transition-colors"
        />
      </form>
    );
  }

  if (variant === "footer") {
    return (
      <form ref={formRef} action={formAction} className="flex">
        <input type="hidden" name="source" value="footer" />
        {emailInput(
          "flex-1 rounded-none border-2 border-background/25 bg-background/5 text-background placeholder:text-background/55 focus-visible:ring-0 focus-visible:border-accent font-mono"
        )}
        <SubmitButton
          variant={variant}
          label={t("subscribe")}
          className="rounded-none bg-accent hover:bg-background text-accent-foreground hover:text-foreground btn-stamp transition-colors"
        />
      </form>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input type="hidden" name="source" value="default" />
      {emailInput("flex-1")}
      <SubmitButton variant={variant} label={t("subscribe")} className="" />
    </form>
  );
}
