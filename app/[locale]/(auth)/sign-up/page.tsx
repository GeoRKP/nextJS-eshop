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
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpForm from "./sign-up-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("signUp"), description: t("signUpDescription") };
}

export default async function SignUpPage(props: {
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
          <CardTitle className="text-center">{t("createAccount")}</CardTitle>
          <CardDescription className="text-center">
            {t("signUpDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
