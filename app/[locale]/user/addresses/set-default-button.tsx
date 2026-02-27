"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { setDefaultAddress } from "@/lib/actions/address.actions";

export default function SetDefaultAddressButton({
  addressId,
}: {
  addressId: string;
}) {
  const { toast } = useToast();
  const t = useTranslations("AddressBook");
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = () => {
    startTransition(async () => {
      const res = await setDefaultAddress(addressId);
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSetDefault}
      disabled={isPending}
    >
      {t("setAsDefault")}
    </Button>
  );
}
