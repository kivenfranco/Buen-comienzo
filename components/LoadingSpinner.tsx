"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <motion.div
        className="relative h-14 w-14"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent" />
      </motion.div>
      <p className="text-white/80 text-sm font-medium">Consultando información…</p>
    </div>
  );
}
