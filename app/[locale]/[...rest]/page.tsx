import { notFound } from "next/navigation";

// Catch-all so unknown paths render the branded app/[locale]/not-found.tsx.
// Without it, next-intl leaves them to Next's global handler and the visitor
// gets the unstyled English default 404 instead.
export default function CatchAllNotFound() {
  notFound();
}
