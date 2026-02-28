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
        y: -3,
        boxShadow: "var(--shadow-card-hover)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  );
}
