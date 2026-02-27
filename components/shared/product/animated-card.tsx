"use client";

import { motion } from "framer-motion";

export default function AnimatedCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: "var(--shadow-card-hover)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}
