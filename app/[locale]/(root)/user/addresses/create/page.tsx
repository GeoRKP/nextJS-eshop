import { getTranslations } from "next-intl/server";
import AddressForm from "@/components/shared/address-form";

export async function generateMetadata() {
  const t = await getTranslations("AddressBook");
  return { title: t("addAddress") };
}

export default async function CreateAddressPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <AddressForm type="Create" />
    </div>
  );
}
