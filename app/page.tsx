"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SearchForm from "@/components/SearchForm";

export default function HomePage() {
  return (
    <main
      className="relative min-h-dvh w-full overflow-x-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1a3a1a 0%, #1b5e20 25%, #2e7d32 55%, #1f4e08 80%, #3d2b00 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-green-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-600/15 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-10">
        {/* Header / Hero */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          {/* Logo */}
          <div className="mb-5 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/25 bg-white/20 backdrop-blur-xl shadow-glass p-3">
              <Image
                src="/logo.png"
                alt="Logo Buen Comienzo"
                width={80}
                height={80}
                className="object-contain drop-shadow-lg"
                priority
                onError={(e) => {
                  // Fallback: hide broken image gracefully
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Fallback icon if logo not found */}
              <span className="absolute text-4xl select-none pointer-events-none opacity-0 [img:not([src])_~_&]:opacity-100">
                🌱
              </span>
            </div>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-4 py-1.5"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
              Alcaldía de Medellín
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-black leading-tight text-white drop-shadow-sm sm:text-3xl"
          >
            Consulta tu citación
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-2 text-base text-white/70 font-medium"
          >
            Entrega de paquete alimentario{" "}
            <span className="font-bold text-amber-300">Buen Comienzo</span>
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-5 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          />
        </motion.header>

        {/* Search form + results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        >
          <SearchForm />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-white/40">
            Programa Buen Comienzo · Alcaldía de Medellín
          </p>
          <p className="mt-1 text-xs text-white/30">
            Todos los derechos reservados © {new Date().getFullYear()}
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-xs text-white/20 hover:text-white/50 transition-colors"
          >
            Panel operativo
          </Link>
        </motion.footer>
      </div>
    </main>
  );
}
