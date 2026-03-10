import { Link } from "@/i18n/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default async function Breadcrumb({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  const t = await getTranslations("Breadcrumb");

  return (
    <nav aria-label={t("navigation")} className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors py-1 px-0.5"
          >
            <Home className="w-4 h-4" />
            <span>{t("home")}</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-4 h-4 text-muted-foreground/70" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors py-1 px-0.5 truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
