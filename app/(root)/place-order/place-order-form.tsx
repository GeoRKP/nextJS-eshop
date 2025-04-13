"use client";

import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/order.actions";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export default function PlaceOrderForm() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createOrder();
    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4 " />
        )}{" "}
        Place Order
      </Button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  );
}
