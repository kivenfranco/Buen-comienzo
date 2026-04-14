"use client";

import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  IdCard,
} from "lucide-react";

interface ResultData {
  nombreCompleto: string;
  nombreSede:     string;
  tipoPaquete:    string;
  horaCitacion:   string;
  identificacion: string;
}

interface Props {
  data: ResultData;
}

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function InfoItem({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`flex items-start gap-3 rounded-2xl p-4 ${
        highlight
          ? "bg-green-500/20 border border-green-400/40"
          : "bg-white/10 border border-white/20"
      }`}
    >
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          highlight ? "bg-green-400/30" : "bg-white/15"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-0.5">
          {label}
        </p>
        <p className="text-base font-bold text-white leading-snug break-words">
          {value || "—"}
        </p>
      </div>
    </motion.div>
  );
}

export default function ResultCard({ data }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Success banner */}
      <motion.div
        variants={itemVariants}
        className="mb-5 flex items-center gap-3 rounded-2xl bg-green-500/25 border border-green-400/50 px-4 py-3"
      >
        <CheckCircle2 className="h-6 w-6 shrink-0 text-green-300" />
        <div>
          <p className="font-bold text-green-200 text-sm">¡Información encontrada!</p>
          <p className="text-green-300/80 text-xs mt-0.5">
            Tu asistencia ha sido registrada automáticamente ✓
          </p>
        </div>
      </motion.div>

      {/* Data grid */}
      <div className="flex flex-col gap-3">
        <InfoItem
          icon={<User className="h-5 w-5 text-white" />}
          label="Participante"
          value={data.nombreCompleto}
        />
        <InfoItem
          icon={<IdCard className="h-5 w-5 text-white" />}
          label="Identificación"
          value={data.identificacion}
        />
        <InfoItem
          icon={<MapPin className="h-5 w-5 text-amber-300" />}
          label="Sede de entrega"
          value={data.nombreSede}
        />
        <InfoItem
          icon={<Package className="h-5 w-5 text-amber-300" />}
          label="Tipo de paquete"
          value={data.tipoPaquete}
        />
        <InfoItem
          icon={<Clock className="h-5 w-5 text-amber-200" />}
          label="Hora de citación"
          value={data.horaCitacion}
          highlight
        />
      </div>
    </motion.div>
  );
}
