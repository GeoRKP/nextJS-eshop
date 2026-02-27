import { getTranslations } from "next-intl/server";
import { getMyAddresses, deleteAddress } from "@/lib/actions/address.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/delete-dialog";
import SetDefaultAddressButton from "./set-default-button";

export async function generateMetadata() {
  const t = await getTranslations("AddressBook");
  return { title: t("addresses") };
}

export default async function AddressesPage() {
  const t = await getTranslations("AddressBook");
  const tCommon = await getTranslations("Common");
  const addresses = await getMyAddresses();

  return (
    <div className="space-y-4">
      <div className="flex-between">
        <h1 className="h2-bold">{t("addresses")}</h1>
        <Button asChild variant="default">
          <Link href="/user/addresses/create">{t("addAddress")}</Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-muted-foreground">{t("noAddresses")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {address.label || address.fullName}
                  </CardTitle>
                  {address.isDefault && (
                    <Badge className="bg-green-600">{t("default")}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
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

                <div className="flex gap-2 pt-3">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
