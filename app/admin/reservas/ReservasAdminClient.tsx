"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Scissors,
  Phone,
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { confirmarReserva } from "../../actions";

type Cita = {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  creadoEn: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    img: string | null;
  };
  barbero: {
    id: number;
    nombre: string;
    img: string | null;
    usuario: { nombre: string; img: string | null };
  };
  servicio: {
    nombre: string;
    precio: string;
    duracion: number;
  };
};

function esCitaExpirada(fecha: string, hora: string): boolean {
  try {
    const d = new Date(fecha);
    const [h, m] = hora.split(":").map(Number);
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d < new Date();
  } catch {
    return false;
  }
}

export default function ReservasAdminClient({ citas: initialCitas }: { citas: Cita[] }) {
  const [citas, setCitas] = useState(initialCitas);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"pendiente" | "todas">("pendiente");

  // Pendientes = solo pendiente y que no hayan expirado
  const pendientes = citas.filter(
    (c) =>
      c.estado.toLowerCase() === "pendiente" &&
      !esCitaExpirada(c.fecha, c.hora)
  );
  const list = filter === "pendiente" ? pendientes : citas;

  const handleConfirmar = async (id: number) => {
    setConfirmingId(id);
    const res = await confirmarReserva(id);
    if (res.success) {
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "confirmada" } : c))
      );
    } else {
      alert(res.error || "No se pudo confirmar");
    }
    setConfirmingId(null);
  };

  const estadoDisplay = (cita: Cita) => {
    const expirada =
      cita.estado.toLowerCase() === "pendiente" &&
      esCitaExpirada(cita.fecha, cita.hora);
    return expirada ? "expirado" : cita.estado;
  };

  const estadoStyle = (estado: string) => {
    const e = estado.toLowerCase();
    if (e === "confirmada")
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (e === "pendiente")
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (e === "cancelada")
      return "bg-red-500/10 text-red-400 border-red-500/20";
    if (e === "expirado")
      return "bg-zinc-600/10 text-zinc-500 border-zinc-600/20";
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  const precioStr = (s: { precio: string }) => s.precio ?? "0";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Filtro */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("pendiente")}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
            filter === "pendiente"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/20"
          }`}
        >
          Pendientes {pendientes.length > 0 && `(${pendientes.length})`}
        </button>
        <button
          onClick={() => setFilter("todas")}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
            filter === "todas"
              ? "bg-white/10 text-white border-white/20"
              : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/20"
          }`}
        >
          Todas
        </button>
      </div>

      {list.length === 0 ? (
        <div className="py-20 text-center rounded-[2.5rem] bg-zinc-900/30 border border-white/5">
          <Calendar className="mx-auto text-zinc-600 mb-4" size={48} />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
            {filter === "pendiente"
              ? "No hay reservas pendientes"
              : "No hay reservas"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((cita) => {
              const isPending = cita.estado.toLowerCase() === "pendiente";
              return (
                <motion.div
                  key={cita.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Foto cliente + datos */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0 flex items-center justify-center">
                        {cita.cliente.img && cita.cliente.img !== "DELETE" ? (
                          <img
                            src={cita.cliente.img}
                            alt={cita.cliente.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon size={24} className="text-zinc-500" />
                        )}
                      </div>
                      <div className="space-y-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-black text-white">
                            {cita.cliente.nombre}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${estadoStyle(
                              estadoDisplay(cita)
                            )}`}
                          >
                            {estadoDisplay(cita)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-2 text-zinc-400">
                            <Mail size={14} />
                            {cita.cliente.email}
                          </span>
                          {cita.cliente.telefono && (
                            <span className="flex items-center gap-2 text-zinc-400">
                              <Phone size={14} />
                              {cita.cliente.telefono}
                            </span>
                          )}
                        </div>

                        {/* Servicio, barbero (con foto), fecha y hora */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <Scissors size={16} className="text-zinc-500" />
                            <span className="font-bold text-white">
                              {cita.servicio.nombre}
                            </span>
                            <span className="text-zinc-500 text-xs">
                              {cita.servicio.duracion} min · Bs. {precioStr(cita.servicio)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 shrink-0 flex items-center justify-center">
                              {(cita.barbero.img && cita.barbero.img !== "DELETE") ||
                              (cita.barbero.usuario.img &&
                                cita.barbero.usuario.img !== "DELETE") ? (
                                <img
                                  src={
                                    cita.barbero.img ||
                                    cita.barbero.usuario.img ||
                                    ""
                                  }
                                  alt={cita.barbero.usuario.nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserIcon size={14} className="text-zinc-500" />
                              )}
                            </div>
                            <span className="text-zinc-300">
                              {cita.barbero.usuario.nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-zinc-500" />
                            <span>
                              {new Date(cita.fecha).toLocaleDateString("es-ES", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-zinc-500" />
                            <span>{cita.hora}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acción Confirmar */}
                    <div className="shrink-0 flex items-center">
                      {isPending && !esCitaExpirada(cita.fecha, cita.hora) ? (
                        <button
                          onClick={() => handleConfirmar(cita.id)}
                          disabled={confirmingId === cita.id}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {confirmingId === cita.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Confirmar
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold uppercase">
                          {estadoDisplay(cita) === "confirmada" ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : estadoDisplay(cita) === "expirado" ? (
                            <AlertCircle size={16} className="text-zinc-500" />
                          ) : (
                            <XCircle size={16} className="text-red-500" />
                          )}
                          {estadoDisplay(cita)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
