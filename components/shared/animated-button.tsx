"use client";

import { motion } from "framer-motion";

export default function AnimatedButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      {children}
    </motion.div>
  );
}
