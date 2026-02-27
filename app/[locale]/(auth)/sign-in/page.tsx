import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            />
          </Link>
          <CardTitle className="text-center">{t("signIn")}</CardTitle>
          <CardDescription className="text-center">
            {t("signInDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
