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
      className="rounded-full hover:bg-red-500/10"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={isInWishlist}
    >
      <Heart
        key={isInWishlist ? "filled" : "empty"}
        className={cn(
          "w-5 h-5 transition-colors",
          isInWishlist
            ? "fill-red-500 text-red-500 animate-[heart-pop_0.4s_cubic-bezier(0.16,1,0.3,1)]"
            : "text-muted-foreground hover:text-red-500"
        )}
      />
    </Button>
  );
}
