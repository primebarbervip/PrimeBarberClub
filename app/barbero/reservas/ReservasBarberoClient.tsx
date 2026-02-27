"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Clock,
  Scissors,
  Phone,
  Calendar,
  User,
  Mail,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { actualizarEstadoCita } from "@/app/actions";

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

function useHoraActual() {
  const [hora, setHora] = useState("");
  useEffect(() => {
    const format = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    format();
    const id = setInterval(format, 60000);
    return () => clearInterval(id);
  }, []);
  return hora;
}

export default function ReservasBarberoClient({ citas }: { citas: Cita[] }) {
  const horaActual = useHoraActual();
  const [selectedId, setSelectedId] = useState<number | null>(
    citas.length > 0 ? citas[0].id : null
  );
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [localCitas, setLocalCitas] = useState(citas);
  const [tabActiva, setTabActiva] = useState<"PENDIENTE" | "CONFIRMADA">("PENDIENTE");

  // Filtrar solo reservas activas (PENDIENTE y CONFIRMADA) y no vencidas
  const citasActivas = useMemo(() => {
    return localCitas.filter(cita => {
      const estado = cita.estado.toUpperCase();
      const esVencida = esCitaExpirada(cita.fecha, cita.hora);
      // Mostrar solo PENDIENTE y CONFIRMADA que no hayan expirado
      return (estado === "PENDIENTE" || estado === "CONFIRMADA") && !esVencida;
    });
  }, [localCitas]);

  // Filtrar según el tab activo
  const citasFiltradas = useMemo(() => {
    const filtradas = citasActivas.filter(cita => 
      cita.estado.toUpperCase() === tabActiva.toUpperCase()
    );
    
    // Ordenar por fecha y hora (más cercanas primero de izquierda a derecha)
    return filtradas.sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      const diffFecha = fechaA.getTime() - fechaB.getTime();
      
      if (diffFecha !== 0) return diffFecha;
      
      // Si tienen la misma fecha, ordenar por hora (de menor a mayor)
      const [horaA, minA] = a.hora.split(':').map(Number);
      const [horaB, minB] = b.hora.split(':').map(Number);
      return (horaA * 60 + minA) - (horaB * 60 + minB);
    });
  }, [citasActivas, tabActiva]);

  const selectedCita = useMemo(
    () => citasFiltradas.find((c) => c.id === selectedId) ?? citasFiltradas[0] ?? null,
    [citasFiltradas, selectedId]
  );

  // Mantener selección si cambian las citas
  useEffect(() => {
    if (citasFiltradas.length > 0 && !selectedCita) setSelectedId(citasFiltradas[0].id);
  }, [citasFiltradas, selectedCita]);

  const handleAceptarReserva = async (citaId: number) => {
    setProcessingId(citaId);
    try {
      const result = await actualizarEstadoCita(citaId, "CONFIRMADA");
      if (result.success) {
        setLocalCitas(prev => prev.map(c => 
          c.id === citaId ? { ...c, estado: "CONFIRMADA" } : c
        ));
      }
    } catch (error) {
      console.error("Error al aceptar reserva:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazarReserva = async (citaId: number) => {
    setProcessingId(citaId);
    try {
      const result = await actualizarEstadoCita(citaId, "CANCELADA");
      if (result.success) {
        setLocalCitas(prev => prev.map(c => 
          c.id === citaId ? { ...c, estado: "CANCELADA" } : c
        ));
      }
    } catch (error) {
      console.error("Error al rechazar reserva:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (citasActivas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 items-center justify-center mb-6">
          <Calendar className="text-zinc-500" size={32} />
        </div>
        <p className="text-zinc-500 font-semibold text-sm uppercase tracking-wider">
          No tienes reservas activas
        </p>
        <p className="text-zinc-600 text-xs mt-2 max-w-sm mx-auto">
          Las citas pendientes y confirmadas aparecerán aquí.
        </p>
      </div>
    );
  }

  if (citasFiltradas.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 md:gap-6 h-[calc(100vh-12rem)] min-h-[420px] pb-20 md:pb-8">
        {/* Tabs */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-800/30 to-transparent">
            <div className="flex gap-2">
              <button
                onClick={() => setTabActiva("PENDIENTE")}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  tabActiva === "PENDIENTE"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-zinc-800/30 text-zinc-500 border border-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                Pendiente
              </button>
              <button
                onClick={() => setTabActiva("CONFIRMADA")}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  tabActiva === "CONFIRMADA"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-zinc-800/30 text-zinc-500 border border-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                Confirmada
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500 text-xs text-center">
              No hay reservas {tabActiva === "PENDIENTE" ? "pendientes" : "confirmadas"}
            </p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 md:gap-6 h-[calc(100vh-12rem)] min-h-[420px] pb-20 md:pb-8">
      {/* Columna izquierda: Desktop - lista de cuadros / Móvil - círculos */}
      <aside className="w-full md:w-80 lg:w-96 shrink-0 border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="p-3 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-800/30 to-transparent">
          <div className="flex gap-2">
            <button
              onClick={() => setTabActiva("PENDIENTE")}
              className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                tabActiva === "PENDIENTE"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-zinc-800/30 text-zinc-500 border border-zinc-800/60 hover:border-zinc-700"
              }`}
            >
              Pendiente ({citasActivas.filter(c => c.estado.toUpperCase() === "PENDIENTE").length})
            </button>
            <button
              onClick={() => setTabActiva("CONFIRMADA")}
              className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                tabActiva === "CONFIRMADA"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-zinc-800/30 text-zinc-500 border border-zinc-800/60 hover:border-zinc-700"
              }`}
            >
              Confirmada ({citasActivas.filter(c => c.estado.toUpperCase() === "CONFIRMADA").length})
            </button>
          </div>
        </div>

        {/* Desktop: Lista de cuadros */}
        <ul className="hidden md:flex md:flex-1 md:overflow-y-auto md:p-3 md:space-y-2 md:flex-col">
          {citasFiltradas.map((cita) => {
            const isSelected = selectedCita?.id === cita.id;
            const isPendiente = cita.estado.toUpperCase() === "PENDIENTE";
            return (
              <li key={cita.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(cita.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-white/10 border-emerald-500/30 ring-2 ring-emerald-500/20"
                      : isPendiente
                      ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60"
                      : "bg-zinc-800/30 border-zinc-800/60 hover:border-zinc-700"
                  }`}
                >
                  {isPendiente && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                  )}
                  
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-zinc-800 shrink-0 flex items-center justify-center font-black text-white">
                    {cita.cliente.img && cita.cliente.img !== "DELETE" ? (
                      <img
                        src={cita.cliente.img}
                        alt={cita.cliente.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">{cita.cliente.nombre.charAt(0).toUpperCase()}</span>
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
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-black text-emerald-400 tabular-nums">
                      {cita.hora}
                    </span>
                    {isPendiente && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        Pendiente
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Móvil: Círculos en fila horizontal */}
        <div className="md:hidden flex-1 overflow-x-auto overflow-y-hidden p-4 flex items-center gap-3">
          {citasFiltradas.length === 0 ? (
            <p className="text-zinc-500 text-xs mx-auto">No hay reservas</p>
          ) : (
            citasFiltradas.map((cita) => {
              const isSelected = selectedCita?.id === cita.id;
              const isPendiente = cita.estado.toUpperCase() === "PENDIENTE";
              return (
                <button
                  key={cita.id}
                  type="button"
                  onClick={() => setSelectedId(cita.id)}
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 shrink-0 flex items-center justify-center transition-all relative font-black text-white text-lg ${
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-500/20"
                      : isPendiente
                      ? "border-amber-400 hover:border-amber-500 bg-amber-500/10"
                      : "border-zinc-600 hover:border-zinc-500 bg-zinc-800/30"
                  }`}
                  title={cita.cliente.nombre}
                >
                  {cita.cliente.img && cita.cliente.img !== "DELETE" ? (
                    <img
                      src={cita.cliente.img}
                      alt={cita.cliente.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{cita.cliente.nombre.charAt(0).toUpperCase()}</span>
                  )}
                  {isPendiente && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-pulse border border-zinc-900" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Columna derecha: hora actual arriba + detalles */}
      <section className="flex-1 min-w-0 border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden flex flex-col">
        {/* Barra superior: hora actual + estado */}
        <div className="px-4 py-3 border-b border-zinc-800/60 bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCita?.estado.toUpperCase() === "PENDIENTE" && (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  REQUIERE CONFIRMACIÓN
                </span>
              </>
            )}
            {selectedCita?.estado.toUpperCase() === "CONFIRMADA" && (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  CONFIRMADA
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              HORA ACTUAL
            </span>
            <span className="text-xl font-black text-white tabular-nums tracking-tight">
              {horaActual}
            </span>
          </div>
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
                {/* Móvil: fotos redondas en fila */}
                <div className="md:hidden flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800/60">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-zinc-800 flex items-center justify-center shrink-0 font-black text-white text-2xl">
                    {selectedCita.cliente.img &&
                    selectedCita.cliente.img !== "DELETE" ? (
                      <img
                        src={selectedCita.cliente.img}
                        alt={selectedCita.cliente.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{selectedCita.cliente.nombre.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black text-white">
                      {selectedCita.cliente.nombre}
                    </h2>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      {selectedCita.cliente.email}
                    </p>
                    {selectedCita.cliente.telefono && (
                      <a
                        href={`https://wa.me/${selectedCita.cliente.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2 transition-colors"
                      >
                        <Phone className="w-3 h-3 shrink-0" />
                        {selectedCita.cliente.telefono}
                      </a>
                    )}
                  </div>
                </div>

                {/* Desktop: foto a la izquierda con info */}
                <div className="hidden md:flex items-start gap-4">
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
                        href={`https://wa.me/${selectedCita.cliente.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 mt-1 transition-colors"
                      >
                        <Phone className="w-4 h-4 shrink-0" />
                        {selectedCita.cliente.telefono}
                      </a>
                    )}
                  </div>
                </div>

                {/* Información de la reserva - Móvil */}
                <div className="md:hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                      RESERVA
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
                        <p className="text-white text-sm">
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

                {/* Desktop: información normal */}
                <div className="hidden md:block">
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

                  {/* Estado Badge */}
                  <div className="mt-6 pt-6 border-t border-zinc-800/60">
                    <div className={`inline-block px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                      selectedCita.estado.toLowerCase() === "pendiente"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : selectedCita.estado.toLowerCase() === "confirmada"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {selectedCita.estado}
                    </div>
                  </div>

                  {/* Action Buttons - Solo para pendientes */}
                  {selectedCita.estado.toUpperCase() === "PENDIENTE" && tabActiva === "PENDIENTE" && (
                    <div className="mt-8 pt-6 border-t border-zinc-700/60">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-4">
                        Confirma o rechaza esta reserva
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAceptarReserva(selectedCita.id)}
                          disabled={processingId === selectedCita.id}
                          className="flex-1 px-4 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          {processingId === selectedCita.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Aceptar Cita
                        </button>
                        <button
                          onClick={() => handleRechazarReserva(selectedCita.id)}
                          disabled={processingId === selectedCita.id}
                          className="flex-1 px-4 py-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                        >
                          {processingId === selectedCita.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                          Rechazar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Móvil: Botones de acción */}
                {selectedCita.estado.toUpperCase() === "PENDIENTE" && tabActiva === "PENDIENTE" && (
                  <div className="md:hidden flex flex-col gap-3 mt-6 pt-6 border-t border-zinc-700/60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
                      Confirma o rechaza
                    </p>
                    <button
                      onClick={() => handleAceptarReserva(selectedCita.id)}
                      disabled={processingId === selectedCita.id}
                      className="w-full px-4 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      {processingId === selectedCita.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Aceptar Cita
                    </button>
                    <button
                      onClick={() => handleRechazarReserva(selectedCita.id)}
                      disabled={processingId === selectedCita.id}
                      className="w-full px-4 py-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                      {processingId === selectedCita.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <X size={16} />
                      )}
                      Rechazar
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
