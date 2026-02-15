"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { eliminarServicio } from "../actions";
import {
  Trash2, Package, Scissors, Pencil, Plus, AlertTriangle, X
} from "lucide-react";

type Servicio = {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
  descripcion: string | null;
  esCombo: boolean;
};

// Añadimos el tipo para el perfil
type Perfil = {
  nombre: string;
  img: string | null;
  especialidad: string | null;
};

export default function BarberoDashboardClient({
  servicios = [],
  barberoId
}: {
  servicios: Servicio[],
  barberoId: number
}) {
  const [activeTab, setActiveTab] = useState<"servicios" | "combos">("servicios");
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; servicio: Servicio | null }>({ show: false, servicio: null });
  const router = useRouter();

  // Filtrar servicios según el tab activo
  const serviciosFiltrados = servicios.filter(s =>
    activeTab === "servicios" ? !s.esCombo : s.esCombo
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">

      {/* HEADER SIMPLE */}
      <header className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Mis Servicios</h1>
        <p className="text-zinc-500 text-sm">Gestiona tus servicios activos</p>
      </header>

      {/* TABS - SERVICIOS / COMBOS */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative flex gap-3 p-1.5 bg-zinc-900/50 rounded-full border border-zinc-800/50 w-fit">
          {/* Animated Background Indicator */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 bg-white rounded-full shadow-lg"
            initial={false}
            animate={{
              left: activeTab === "servicios" ? "6px" : "50%",
              width: activeTab === "servicios" ? "calc(50% - 12px)" : "calc(50% - 6px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <button
            onClick={() => setActiveTab("servicios")}
            className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === "servicios"
              ? "text-black"
              : "text-zinc-400 hover:text-white"
              }`}
          >
            <Scissors className="inline-block w-4 h-4 mr-2 mb-0.5" />
            Servicios ({servicios.filter(s => !s.esCombo).length})
          </button>

          <button
            onClick={() => setActiveTab("combos")}
            className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === "combos"
              ? "text-black"
              : "text-zinc-400 hover:text-white"
              }`}
          >
            <Package className="inline-block w-4 h-4 mr-2 mb-0.5" />
            Combos ({servicios.filter(s => s.esCombo).length})
          </button>
        </div>
      </div>

      {/* LISTADO DE SERVICIOS - Lista en móvil, Grid en desktop */}
      <section className="max-w-7xl mx-auto pb-32">
        {serviciosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              {activeTab === "servicios" ? (
                <Scissors size={32} className="text-zinc-600" />
              ) : (
                <Package size={32} className="text-zinc-600" />
              )}
            </div>
            <p className="text-zinc-500 text-sm">
              No hay {activeTab === "servicios" ? "servicios" : "combos"} registrados
            </p>
          </div>
        ) : (
          <div className="space-y-2 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
            {serviciosFiltrados.map((s, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, ease: "easeOut" }}
                key={s.id}
                className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-5 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  {/* LEFT: Icon + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${s.esCombo
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-white/10 text-white'
                      }`}>
                      {s.esCombo ? <Package size={20} /> : <Scissors size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-white truncate">
                        {s.nombre}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {s.precio} BOB · {s.duracion} min
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/barbero/servicios/editar/${s.id}`)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/50 text-zinc-400 hover:bg-white hover:text-black transition-all"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, servicio: s })}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* BOTÓN FLOTANTE (+) - NAVEGA A PÁGINA */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push(`/barbero/servicios/nuevo?tipo=${activeTab === "combos" ? "combo" : "servicio"}`)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl z-40 lg:bottom-10 lg:right-24"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ show: false, servicio: null })}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-zinc-900/95 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-500/10"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500" size={32} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tight">
                ¿Eliminar Servicio?
              </h3>

              {/* Message */}
              <p className="text-sm text-zinc-400 text-center mb-2">
                Estás a punto de eliminar:
              </p>
              <p className="text-base font-bold text-white text-center mb-6">
                {deleteModal.servicio?.nombre}
              </p>
              <p className="text-xs text-zinc-500 text-center mb-8">
                Esta acción no se puede deshacer
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, servicio: null })}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (deleteModal.servicio) {
                      await eliminarServicio(deleteModal.servicio.id);
                      setDeleteModal({ show: false, servicio: null });
                      router.refresh();
                    }
                  }}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wider transition-all active:scale-95"
                >
                  Eliminar
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setDeleteModal({ show: false, servicio: null })}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}