"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Download,
  ArrowLeft,
  Lock,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participante {
  rowIndex:               number;
  identificacion:         string;
  nombreCompleto:         string;
  nombreSede:             string;
  tipoPaquete:            string;
  horaCitacion:           string;
  confirmacionAsistencia: string;
  fechaConfirmacion:      string;
}

interface Stats {
  total:       number;
  confirmados: number;
  pendientes:  number;
  porcentaje:  number;
}

type Tab    = "todos" | "confirmados" | "pendientes";
type SortBy = "nombre" | "sede" | "hora" | "estado";
type SortDir = "asc" | "desc";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: "green" | "amber" | "blue" | "white";
}) {
  const colors = {
    green: "bg-green-500/20 border-green-400/30 text-green-300",
    amber: "bg-amber-500/20 border-amber-400/30 text-amber-300",
    blue:  "bg-sky-500/20  border-sky-400/30  text-sky-300",
    white: "bg-white/10    border-white/20     text-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 backdrop-blur-md ${colors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
            {label}
          </p>
          <p className="text-3xl font-black">{value}</p>
          {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}

// Normaliza texto: sin tildes, mayúsculas, sin espacios
const norm = (s: string) =>
  s.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ─── Badge ────────────────────────────────────────────────────────────────────

function StatusBadge({ value }: { value: string }) {
  const isConfirmed = norm(value) === "CONFIRMO";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        isConfirmed
          ? "bg-green-500/25 text-green-300 border border-green-400/40"
          : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
      }`}
    >
      {isConfirmed ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {isConfirmed ? "Confirmó" : "Pendiente"}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [password, setPassword]     = useState("");
  const [authed, setAuthed]         = useState(false);
  const [pwdError, setPwdError]     = useState(false);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tab, setTab]               = useState<Tab>("todos");
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState<SortBy>("nombre");
  const [sortDir, setSortDir]       = useState<SortDir>("asc");

  const fetchData = useCallback(async (pwd: string) => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/dashboard?pwd=${encodeURIComponent(pwd)}`);
      const json = await res.json();

      if (res.status === 401) {
        setPwdError(true);
        setAuthed(false);
        return;
      }

      if (!res.ok || !json.success) {
        setError(json.message ?? "Error al cargar los datos.");
        return;
      }

      setPwdError(false);
      setAuthed(true);
      setStats(json.stats);
      setParticipantes(json.participantes);
      setLastUpdate(new Date());
    } catch {
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchData(password);
  }

  // Auto-refresh every 60s
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => fetchData(password), 60_000);
    return () => clearInterval(id);
  }, [authed, fetchData, password]);

  // ── Filtering & sorting ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = participantes;

    if (tab === "confirmados")
      list = list.filter(
        (p) => norm(p.confirmacionAsistencia) === "CONFIRMO"
      );
    else if (tab === "pendientes")
      list = list.filter(
        (p) => norm(p.confirmacionAsistencia) !== "CONFIRMO"
      );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nombreCompleto.toLowerCase().includes(q) ||
          p.identificacion.includes(q) ||
          p.nombreSede.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const map: Record<SortBy, string> = {
        nombre: "nombreCompleto",
        sede:   "nombreSede",
        hora:   "horaCitacion",
        estado: "confirmacionAsistencia",
      };
      const key = map[sortBy] as keyof Participante;
      const av  = String(a[key]).toLowerCase();
      const bv  = String(b[key]).toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [participantes, tab, search, sortBy, sortDir]);

  function toggleSort(col: SortBy) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortBy }) {
    if (sortBy !== col) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />;
  }

  // ── CSV export ──────────────────────────────────────────────────────────

  function exportCSV() {
    const headers = [
      "Identificación","Nombre","Sede","Tipo Paquete","Hora Citación","Estado","Fecha Confirmación",
    ];
    const rows = filtered.map((p) => [
      p.identificacion,
      p.nombreCompleto,
      p.nombreSede,
      p.tipoPaquete,
      p.horaCitacion,
      p.confirmacionAsistencia || "PENDIENTE",
      p.fechaConfirmacion,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `buen_comienzo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(160deg,#0369a1 0%,#0284c7 30%,#0ea5e9 65%,#38bdf8 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-glass"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/25 border border-amber-400/40">
              <Lock className="h-7 w-7 text-amber-300" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black text-white">Panel de Control</h1>
              <p className="text-sm text-white/60 mt-1">Buen Comienzo · Alcaldía de Medellín</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Contraseña de acceso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwdError(false); }}
                placeholder="••••••••"
                className={`w-full rounded-2xl border px-4 py-3 bg-white/15 text-white placeholder-white/30 outline-none transition-all
                  focus:ring-2 focus:ring-amber-400/50
                  ${pwdError ? "border-red-400/60" : "border-white/25"}`}
                autoComplete="current-password"
              />
              {pwdError && (
                <p className="mt-2 text-xs text-red-300 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Contraseña incorrecta
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-3.5 font-black text-white transition-all"
            >
              {loading ? "Verificando…" : "Ingresar al panel"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "todos",       label: "Todos",      count: participantes.length },
    { key: "confirmados", label: "Confirmados", count: stats?.confirmados ?? 0 },
    { key: "pendientes",  label: "Pendientes",  count: stats?.pendientes  ?? 0 },
  ];

  return (
    <main
      className="min-h-dvh"
      style={{
        background:
          "linear-gradient(160deg,#0369a1 0%,#0284c7 30%,#0ea5e9 65%,#38bdf8 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">

        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Inicio
            </Link>
            <h1 className="text-2xl font-black text-white leading-tight">
              Panel de Control
            </h1>
            <p className="text-sm text-white/60 mt-0.5">
              Entrega paquete alimentario · Buen Comienzo
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => fetchData(password)}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            {lastUpdate && (
              <p className="text-xs text-white/40">
                Actualizado{" "}
                {lastUpdate.toLocaleTimeString("es-CO", {
                  hour:   "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<Users className="h-8 w-8" />}
              color="white"
            />
            <StatCard
              label="Confirmados"
              value={stats.confirmados}
              icon={<CheckCircle2 className="h-8 w-8" />}
              color="green"
            />
            <StatCard
              label="Pendientes"
              value={stats.pendientes}
              icon={<Clock className="h-8 w-8" />}
              color="amber"
            />
            <StatCard
              label="Asistencia"
              value={`${stats.porcentaje}%`}
              sub={`${stats.confirmados} de ${stats.total}`}
              icon={
                <div className="text-2xl font-black text-sky-300">
                  {stats.porcentaje}%
                </div>
              }
              color="blue"
            />
          </div>
        )}

        {/* ── Progress bar ── */}
        {stats && (
          <div className="mb-6 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4">
            <div className="mb-2 flex justify-between text-xs text-white/70">
              <span className="font-semibold">Progreso de confirmaciones</span>
              <span>{stats.confirmados} / {stats.total}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/15 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${stats.porcentaje}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-green-400 font-semibold">
                {stats.confirmados} confirmados
              </span>
              <span className="text-amber-400 font-semibold">
                {stats.pendientes} pendientes
              </span>
            </div>
          </div>
        )}

        {/* ── Controls: tabs + search + export ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-1 gap-1 w-full sm:w-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 sm:flex-none rounded-lg px-3 py-2 text-sm font-bold transition-all ${
                  tab === t.key
                    ? "bg-white/25 text-white shadow"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    tab === t.key ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + export */}
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar nombre o cédula…"
                className="w-full rounded-xl border border-white/20 bg-white/15 pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all"
              />
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 px-3 py-2.5 text-sm font-semibold text-white transition-all"
              title="Exportar a CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-white/50">
            {(
              [
                { label: "Nombre",    col: "nombre" as SortBy },
                { label: "Sede",      col: "sede"   as SortBy },
                { label: "Hora",      col: "hora"   as SortBy },
                { label: "Paquete",   col: null },
                { label: "Estado",    col: "estado" as SortBy },
              ] as const
            ).map(({ label, col }) => (
              <button
                key={label}
                onClick={() => col && toggleSort(col)}
                className={`flex items-center gap-1 text-left ${col ? "hover:text-white/80 transition-colors" : ""}`}
              >
                {label}
                {col && <SortIcon col={col} />}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/8">
            <AnimatePresence mode="popLayout">
              {loading && participantes.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-white/50 text-sm">
                  Cargando datos…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-white/50">
                  <Search className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No se encontraron registros</p>
                </div>
              ) : (
                filtered.map((p, i) => (
                  <motion.div
                    key={p.rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm leading-snug">
                            {p.nombreCompleto || "—"}
                          </p>
                          <p className="text-xs text-white/50">{p.identificacion}</p>
                        </div>
                        <StatusBadge value={p.confirmacionAsistencia} />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/60">
                        <span>{p.nombreSede}</span>
                        <span>·</span>
                        <span>{p.horaCitacion}</span>
                        <span>·</span>
                        <span>{p.tipoPaquete}</span>
                      </div>
                      {p.fechaConfirmacion && (
                        <p className="text-xs text-green-400/70">
                          Confirmó: {p.fechaConfirmacion}
                        </p>
                      )}
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-2 items-center">
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">
                          {p.nombreCompleto || "—"}
                        </p>
                        <p className="text-xs text-white/45">{p.identificacion}</p>
                      </div>
                      <p className="text-sm text-white/75 truncate">{p.nombreSede || "—"}</p>
                      <p className="text-sm text-white/75">{p.horaCitacion || "—"}</p>
                      <p className="text-sm text-white/75 truncate">{p.tipoPaquete || "—"}</p>
                      <div>
                        <StatusBadge value={p.confirmacionAsistencia} />
                        {p.fechaConfirmacion && (
                          <p className="text-xs text-green-400/60 mt-0.5 truncate">
                            {p.fechaConfirmacion}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer row count */}
          {filtered.length > 0 && (
            <div className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
              Mostrando {filtered.length} de {participantes.length} participantes
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
