"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, RotateCcw } from "lucide-react";
import ResultCard from "./ResultCard";
import NoteCard from "./NoteCard";
import LoadingSpinner from "./LoadingSpinner";

interface ResultData {
  nombreCompleto: string;
  nombreSede:     string;
  tipoPaquete:    string;
  horaCitacion:   string;
  identificacion: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function SearchForm() {
  const [identificacion, setIdentificacion] = useState("");
  const [status, setStatus]                 = useState<Status>("idle");
  const [result, setResult]                 = useState<ResultData | null>(null);
  const [errorMsg, setErrorMsg]             = useState("");
  const inputRef                            = useRef<HTMLInputElement>(null);
  const resultsRef                          = useRef<HTMLDivElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setIdentificacion(digits);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identificacion || identificacion.length < 5) {
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res  = await fetch("/api/consultar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identificacion }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setResult(json.data);
        setStatus("success");
        // Scroll to results after a short delay
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      } else {
        setErrorMsg(json.message ?? "No se pudo obtener información.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Error de conexión. Verifica tu internet e intenta de nuevo.");
      setStatus("error");
    }
  }

  function handleReset() {
    setIdentificacion("");
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const isLoading = status === "loading";

  return (
    <div className="w-full space-y-6">
      {/* Search card */}
      <div className="rounded-3xl border border-white/20 bg-white/15 backdrop-blur-xl p-6 shadow-glass">
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="identificacion"
            className="block text-sm font-semibold text-white/80 mb-2 tracking-wide"
          >
            Número de identificación del participante
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              id="identificacion"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={identificacion}
              onChange={handleInput}
              disabled={isLoading}
              placeholder="Ej: 1234567890"
              maxLength={15}
              autoComplete="off"
              className="w-full rounded-2xl border border-white/30 bg-white/20 px-5 py-4 pr-14 text-lg font-bold text-white placeholder-white/40 outline-none ring-0 transition-all duration-200
                focus:border-amber-400/70 focus:bg-white/25 focus:ring-2 focus:ring-amber-400/40
                disabled:opacity-60 disabled:cursor-not-allowed
                caret-amber-300"
              aria-label="Número de identificación"
            />
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-white/40" />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || identificacion.length < 5}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="mt-4 w-full rounded-2xl bg-amber-500 py-4 px-6 text-lg font-black text-white shadow-lg
              transition-all duration-200
              hover:bg-amber-400
              active:bg-amber-600
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          >
            {isLoading ? "Consultando…" : "Consultar citación"}
          </motion.button>
        </form>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6"
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-red-400/40 bg-red-500/20 backdrop-blur-xl p-5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-300" />
              <div className="flex-1">
                <p className="font-bold text-red-200 mb-1">No encontrado</p>
                <p className="text-red-100/80 text-sm leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150"
            >
              <RotateCcw className="h-4 w-4" />
              Intentar con otro documento
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {status === "success" && result && (
          <motion.div
            key="results"
            ref={resultsRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Result card */}
            <div className="rounded-3xl border border-green-400/30 bg-green-900/20 backdrop-blur-xl p-5 shadow-glass">
              <ResultCard data={result} />

              {/* New search button */}
              <button
                onClick={handleReset}
                className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/80 transition-all duration-150 w-full justify-center"
              >
                <RotateCcw className="h-4 w-4" />
                Consultar otra identificación
              </button>
            </div>

            {/* Institutional note */}
            <NoteCard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show note always when idle */}
      <AnimatePresence>
        {status === "idle" && (
          <motion.div
            key="idle-note"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <NoteCard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
