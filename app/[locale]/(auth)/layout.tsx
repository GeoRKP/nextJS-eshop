import { APP_NAME } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Truck, ShieldCheck, RotateCcw, Wrench } from "lucide-react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("Auth");

  const points = [
    { icon: Wrench, label: t("statParts") },
    { icon: Truck, label: t("statShipping") },
    { icon: RotateCcw, label: t("statWarranty") },
    { icon: ShieldCheck, label: t("statRating") },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel (desktop) */}
      <aside className="hidden lg:flex lg:w-[44%] xl:w-2/5 relative overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-industrial" aria-hidden="true" />
        <div className="absolute inset-0 industrial-stripe opacity-30" aria-hidden="true" />
        {/* Hazard strip on the seam between brand panel and form */}
        <div className="absolute inset-y-0 right-0 w-1.5 hazard-stripe" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Image
              src="/images/logo.png"
              width={44}
              height={44}
              alt=""
              priority
            />
            <span className="font-heading font-black text-xl uppercase tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          <div className="py-12">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-brand-accent mb-4">
              {t("brandEyebrow")}
            </p>
            <p className="h2-display max-w-md">{t("brandHeadline")}</p>
            <p className="text-primary-foreground/60 mt-6 max-w-sm text-sm leading-relaxed">
              {t("authTagline")}
            </p>
          </div>

          <ul className="divide-y divide-primary-foreground/10 border-y border-primary-foreground/10">
            {points.map((item) => (
              <li key={item.label} className="flex items-center gap-3 py-3">
                <item.icon
                  className="w-4 h-4 text-brand-accent shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm text-primary-foreground/80">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex-1 flex flex-col bg-gradient-subtle">
        {/* Mobile header — in flow, so it can never overlap the form */}
        <div
          className="lg:hidden bg-primary text-primary-foreground"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <Link href="/" className="flex items-center gap-2.5 px-4 py-3 w-fit">
            <Image
              src="/images/logo.png"
              width={32}
              height={32}
              alt=""
              priority
            />
            <span className="font-heading font-bold uppercase tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <div className="h-1 hazard-stripe" aria-hidden="true" />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
