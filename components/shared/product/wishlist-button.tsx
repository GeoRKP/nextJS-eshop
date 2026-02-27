"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useOptimistic } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist.actions";
import { cn } from "@/lib/utils";

export default function WishlistButton({
  productId,
  isInWishlist: initialIsInWishlist,
}: {
  productId: string;
  isInWishlist: boolean;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticInWishlist, setOptimisticInWishlist] = useOptimistic(
    initialIsInWishlist
  );

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticInWishlist(!optimisticInWishlist);
      const res = await toggleWishlist(productId);
      if (!res.success) {
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
          optimisticInWishlist
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
