"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type WishlistContextType = {
  wishlistIds: Set<string>;
  isLoaded: boolean;
  toggle: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  isLoaded: false,
  toggle: () => {},
});

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  /** Skip the /api/wishlist fetch entirely for anonymous visitors. */
  enabled?: boolean;
}) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true);
      return;
    }
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        setWishlistIds(new Set(data.productIds));
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, [enabled]);

  const toggle = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoaded, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}
