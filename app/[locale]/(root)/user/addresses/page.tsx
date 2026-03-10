import { getTranslations } from "next-intl/server";
import { getMyAddresses, deleteAddress } from "@/lib/actions/address.actions";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/delete-dialog";
import SetDefaultAddressButton from "./set-default-button";
import { MapPin } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("AddressBook");
  return { title: t("addresses") };
}

export default async function AddressesPage() {
  const t = await getTranslations("AddressBook");
  const tCommon = await getTranslations("Common");
  const addresses = await getMyAddresses();

  return (
    <div className="space-y-6">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-brand-accent" />
          <h1 className="h2-bold">{t("addresses")}</h1>
        </div>
        <Button asChild variant="accent">
          <Link href="/user/addresses/create">{t("addAddress")}</Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">{t("noAddresses")}</p>
          <Button asChild variant="accent" size="lg">
            <Link href="/user/addresses/create">{t("addAddress")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="card-premium overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border/40">
                <h3 className="font-heading font-bold text-sm uppercase">
                  {address.label || address.fullName}
                </h3>
                {address.isDefault && (
                  <Badge variant="accent">{t("default")}</Badge>
                )}
              </div>
              <div className="p-4 md:p-5 space-y-1 text-sm">
                <p className="font-medium">{address.fullName}</p>
                {address.phone && (
                  <p className="text-muted-foreground">{address.phone}</p>
                )}
                <p>{address.address}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                  {address.city}
                  {address.state ? `, ${address.state}` : ""}{" "}
                  {address.postalCode}
                </p>
                <p>{address.country}</p>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/user/addresses/${address.id}`}>
                      {tCommon("edit")}
                    </Link>
                  </Button>
                  {!address.isDefault && (
                    <SetDefaultAddressButton addressId={address.id} />
                  )}
                  <DeleteDialog id={address.id} action={deleteAddress} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
