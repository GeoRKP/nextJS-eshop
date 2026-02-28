import { APP_NAME } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import { Truck, Shield, Star, Package } from "lucide-react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("Auth");

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding with industrial stripe */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-brand-accent/20" />
        {/* Industrial stripe pattern overlay */}
        <div className="absolute inset-0 industrial-stripe opacity-20" />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <h1 className="font-heading text-4xl font-black tracking-tight uppercase mb-4">{APP_NAME}</h1>
          <p className="text-lg text-primary-foreground/70 mb-12 max-w-md">
            {t("authTagline")}
          </p>

          {/* Trust stats with glass-card */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, label: t("statParts") },
              { icon: Truck, label: t("statShipping") },
              { icon: Shield, label: t("statWarranty") },
              { icon: Star, label: t("statRating") },
            ].map((item) => (
              <div key={item.label} className="glass-card flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-brand-accent" />
                </div>
                <span className="text-sm text-primary-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile branded header — shown only on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
        <h2 className="font-heading font-bold text-lg uppercase">{APP_NAME}</h2>
        <p className="text-xs text-primary-foreground/60 truncate">{t("authTagline")}</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-subtle pt-20 lg:pt-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
