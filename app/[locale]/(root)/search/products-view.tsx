"use client";

import { type ReactNode } from "react";
import { useView } from "./view-context";

export default function ProductsView({
  gridContent,
  listContent,
}: {
  gridContent: ReactNode;
  listContent: ReactNode;
}) {
  const { view } = useView();
  return <>{view === "list" ? listContent : gridContent}</>;
}
