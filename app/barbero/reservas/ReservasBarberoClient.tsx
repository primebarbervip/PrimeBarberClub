"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Clock,
  Scissors,
  Phone,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  servicio: {
    nombre: string;
    precio: string;
    duracion: number;
  };
};

function useHoraActual() {
  const [hora, setHora] = useState("");
  useEffect(() => {
    const format = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    format();
    const id = setInterval(format, 1000);
    return () => clearInterval(id);
  }, []);
  return hora;
}

export default function ReservasBarberoClient({ citas }: { citas: Cita[] }) {
  const horaActual = useHoraActual();
  const [selectedId, setSelectedId] = useState<number | null>(
    citas.length > 0 ? citas[0].id : null
  );

  const selectedCita = useMemo(
    () => citas.find((c) => c.id === selectedId) ?? citas[0] ?? null,
    [citas, selectedId]
  );

  // Mantener selección si cambian las citas
  useEffect(() => {
    if (citas.length > 0 && !selectedCita) setSelectedId(citas[0].id);
  }, [citas, selectedCita]);

  if (citas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 items-center justify-center mb-6">
          <Calendar className="text-zinc-500" size={32} />
        </div>
        <p className="text-zinc-500 font-semibold text-sm uppercase tracking-wider">
          No tienes reservas confirmadas
        </p>
        <p className="text-zinc-600 text-xs mt-2 max-w-sm mx-auto">
          Las citas confirmadas por el administrador aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 md:gap-6 h-[calc(100vh-12rem)] min-h-[420px] pb-20 md:pb-8">
      {/* Columna izquierda: lista de cuadros (foto + hora) */}
      <aside className="w-full md:w-80 lg:w-96 shrink-0 border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-zinc-800/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Reservas
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto p-3 space-y-2">
          {citas.map((cita) => {
            const isSelected = selectedCita?.id === cita.id;
            return (
              <li key={cita.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(cita.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-white/10 border-emerald-500/30"
                      : "bg-zinc-800/30 border-zinc-800/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0 flex items-center justify-center">
                    {cita.cliente.img && cita.cliente.img !== "DELETE" ? (
                      <img
                        src={cita.cliente.img}
                        alt={cita.cliente.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate text-sm">
                      {cita.cliente.nombre}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {cita.servicio.nombre}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-400 tabular-nums shrink-0">
                    {cita.hora}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Columna derecha: hora actual arriba + detalles */}
      <section className="flex-1 min-w-0 border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden flex flex-col">
        {/* Barra superior: hora actual */}
        <div className="px-4 py-3 border-b border-zinc-800/60 bg-zinc-800/30 flex items-center justify-end">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mr-2">
            Hora actual
          </span>
          <span className="text-xl font-black text-white tabular-nums tracking-tight">
            {horaActual}
          </span>
        </div>

        {/* Contenido: detalles del usuario y reserva */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedCita && (
              <motion.div
                key={selectedCita.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0 flex items-center justify-center">
                    {selectedCita.cliente.img &&
                    selectedCita.cliente.img !== "DELETE" ? (
                      <img
                        src={selectedCita.cliente.img}
                        alt={selectedCita.cliente.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {selectedCita.cliente.nombre}
                    </h2>
                    <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 shrink-0" />
                      {selectedCita.cliente.email}
                    </p>
                    {selectedCita.cliente.telefono && (
                      <a
                        href={`tel:${selectedCita.cliente.telefono}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 mt-1 transition-colors"
                      >
                        <Phone className="w-4 h-4 shrink-0" />
                        {selectedCita.cliente.telefono}
                      </a>
                    )}
                  </div>
                </div>

                <div className="h-px bg-zinc-800/60" />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                    Reserva
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Scissors className="w-5 h-5 text-emerald-500/80 shrink-0" />
                      <div>
                        <p className="font-bold text-white">
                          {selectedCita.servicio.nombre}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {selectedCita.servicio.duracion} min · Bs.{" "}
                          {selectedCita.servicio.precio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-zinc-500 shrink-0" />
                      <p className="text-white">
                        {new Date(selectedCita.fecha).toLocaleDateString(
                          "es-ES",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-zinc-500 shrink-0" />
                      <p className="text-white font-semibold tabular-nums">
                        {selectedCita.hora}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
