import React from "react";

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightText({
  text,
  query,
}: {
  text: string;
  query?: string;
}) {
  if (!query || query.trim() === "") {
    return <>{text}</>;
  }

  const escaped = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-brand-accent/20 dark:bg-brand-accent/30 rounded-sm"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
