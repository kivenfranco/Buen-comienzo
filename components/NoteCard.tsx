"use client";

import { motion } from "framer-motion";
import { Info, Download } from "lucide-react";

export default function NoteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }}
      className="w-full rounded-3xl border border-amber-300/40 bg-amber-500/15 backdrop-blur-md p-5 shadow-glass"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/30">
          <Info className="h-4 w-4 text-amber-200" />
        </div>
        <h3 className="font-bold text-amber-100 text-sm uppercase tracking-wide">
          Información importante
        </h3>
      </div>

      {/* Main note */}
      <div className="space-y-3 text-sm text-white/90 leading-relaxed">
        <p className="font-semibold text-white">
          El día <span className="text-amber-300">JUEVES 30 de abril</span> se
          realizará la entrega del paquete alimentario en el{" "}
          <span className="text-amber-300">
            Centro de Salud Limonar (Carrera 63 # 49B sur 7)
          </span>
          .
        </p>

        <div className="rounded-2xl bg-white/10 border border-white/20 p-4 space-y-2">
          <p className="font-semibold text-amber-200 mb-3">🔔 Recuerda:</p>
          <ul className="space-y-1.5">
            {[
              "🛍️ Llevar bolsa ecológica",
              "⏰ Asistir puntual",
              "🙌 Tener paciencia y respetar la fila",
              "🪪 Traer documentos de identificación — sin documentos NO SE HACE ENTREGA",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white/10 border border-white/20 p-4 space-y-2">
          <p className="font-semibold text-amber-200 mb-2">
            👥 Si va a asistir otra persona diferente a la madre/padre o gestante debe llevar:
          </p>
          <ul className="space-y-1.5">
            {[
              "📱 Celular donde podamos verificar el mensaje de convocatoria",
              "📄 Copia del documento de identidad del participante",
              "📄 Copia del documento de identidad de la persona que va a reclamar",
              "📄 Carta de autorización impresa de entrega de paquete alimentario",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/60 pt-1 italic">
            La carta de autorización solo aplica para amigos, vecinos, suegros,
            cuñados y padrastros.
          </p>
        </div>

        <p className="text-xs text-white/70 italic bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2">
          🚗 No se permite el ingreso de vehículos y motos al centro de salud.
        </p>
      </div>

      {/* Download button */}
      <a
        href="/CARTA_DE_AUTORIZACION.docx"
        download="Carta_Autorizacion_Buen_Comienzo.docx"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-200 active:scale-95"
      >
        <Download className="h-5 w-5" />
        Descargar carta de autorización
      </a>
    </motion.div>
  );
}
