"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist.actions";
import { cn } from "@/lib/utils";
import { useWishlist } from "./wishlist-provider";

export default function WishlistButton({
  productId,
}: {
  productId: string;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { wishlistIds, toggle } = useWishlist();
  const isInWishlist = wishlistIds.has(productId);

  const handleToggle = () => {
    startTransition(async () => {
      toggle(productId);
      const res = await toggleWishlist(productId);
      if (!res.success) {
        toggle(productId); // revert on failure
        toast({
          description: res.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-colors",
          isInWishlist
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
