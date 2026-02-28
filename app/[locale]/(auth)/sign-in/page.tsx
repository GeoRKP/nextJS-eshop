import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import CredentialsSignInForm from "./credentials-signin-form";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("signIn"), description: t("signInDescription") };
}

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();
  const t = await getTranslations("Auth");

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <Link href="/" className="inline-block lg:hidden mb-6">
          <Image
            src="/images/logo.svg"
            width={64}
            height={64}
            alt={`${APP_NAME} logo`}
            priority={true}
          />
        </Link>
        <h1 className="h2-bold">{t("welcomeBack")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("signInDescription")}
        </p>
      </div>
      <CredentialsSignInForm />
    </div>
  );
}
