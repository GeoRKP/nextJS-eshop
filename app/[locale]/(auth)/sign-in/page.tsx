import CredentialsSignInForm from "./credentials-signin-form";
import AuthCard from "../auth-card";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import { ShoppingCart } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("signIn"), description: t("signInDescription") };
}

const CHECKOUT_PATHS = /^\/(?:en\/)?(?:cart|shipping-address|payment-method|place-order)/;

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();
  const t = await getTranslations("Auth");

  if (session) {
    return redirect(safeCallbackUrl(callbackUrl));
  }

  return (
    <div className="w-full">
      {CHECKOUT_PATHS.test(callbackUrl ?? "") && (
        <p className="mb-4 flex items-center gap-2.5 border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm">
          <ShoppingCart
            className="w-4 h-4 text-brand-accent shrink-0"
            aria-hidden="true"
          />
          {t("continueCheckoutNotice")}
        </p>
      )}
      <AuthCard title={t("welcomeBack")} description={t("signInDescription")}>
        <CredentialsSignInForm />
      </AuthCard>
    </div>
  );
}
