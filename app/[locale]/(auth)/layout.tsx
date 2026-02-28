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
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-brand-orange/20" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-brand-orange/10" />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <h1 className="text-4xl font-black tracking-tight mb-4">{APP_NAME}</h1>
          <p className="text-lg text-primary-foreground/70 mb-12 max-w-md">
            {t("authTagline")}
          </p>

          {/* Trust stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Package, label: t("statParts") },
              { icon: Truck, label: t("statShipping") },
              { icon: Shield, label: t("statWarranty") },
              { icon: Star, label: t("statRating") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-brand-orange" />
                </div>
                <span className="text-sm text-primary-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
