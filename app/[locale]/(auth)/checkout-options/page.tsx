import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { localePath } from "@/lib/locale-path";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import AuthCard from "../auth-card";
import GuestCheckoutForm from "./guest-checkout-form";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("checkoutOptions") };
}

export default async function CheckoutOptionsPage(props: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();
  const t = await getTranslations("Auth");

  const target = safeCallbackUrl(callbackUrl, "/shipping-address");

  if (session) {
    redirect(await localePath(target));
  }

  const qs = `?callbackUrl=${encodeURIComponent(target)}`;

  return (
    <div className="w-full">
      <AuthCard
        title={t("checkoutOptionsTitle")}
        description={t("checkoutOptionsDescription")}
      >
        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href={`/sign-in${qs}`}>
              <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
              {t("signIn")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={`/sign-up${qs}`}>
              <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
              {t("createAccount")}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="divider-gradient flex-1" />
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
            {t("orGuest")}
          </span>
          <div className="divider-gradient flex-1" />
        </div>

        <GuestCheckoutForm callbackUrl={target} />
      </AuthCard>
    </div>
  );
}
