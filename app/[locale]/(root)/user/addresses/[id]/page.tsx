import { getTranslations } from "next-intl/server";
import AddressForm from "@/components/shared/address-form";
import { getAddressById } from "@/lib/actions/address.actions";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("AddressBook");
  return { title: t("editAddress") };
}

export default async function EditAddressPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const address = await getAddressById(id);
  if (!address) notFound();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <AddressForm type="Update" address={address} addressId={id} />
    </div>
  );
}
