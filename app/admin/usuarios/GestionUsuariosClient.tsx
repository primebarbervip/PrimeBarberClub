"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Scissors, Trash2, Search, Loader2, ArrowLeft, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { cambiarRolUsuario, eliminarUsuario } from "@/app/actions-admin";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  img: string | null;
  perfilBarbero?: {
    img: string | null;
  } | null;
};

export default function GestionUsuariosClient({ usuarios = [] }: { usuarios: Usuario[] }) {
  const [lista, setLista] = useState<Usuario[]>(usuarios);
  const [busqueda, setBusqueda] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ESTADO PARA EL MODAL DE CONFIRMACIÓN CUSTOM
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    tipo: "rol" | "eliminar";
    id: string;
    nombre: string;
    nuevoRol?: string;
  }>({ show: false, tipo: "rol", id: "", nombre: "" });

  useEffect(() => {
    setLista(usuarios);
  }, [usuarios]);

  const filtrarUsuarios = lista.filter((u) =>
    u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función que se ejecuta al darle "Confirmar" en el modal custom
  const procesarAccion = async () => {
    const { tipo, id, nuevoRol } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    setLoadingId(id);

    try {
      if (tipo === "rol" && nuevoRol) {
        const resultado = await cambiarRolUsuario(id, nuevoRol);
        if (resultado.success) setLista(lista.map((u) => u.id === id ? { ...u, rol: nuevoRol } : u));
      } else if (tipo === "eliminar") {
        const resultado = await eliminarUsuario(id);
        if (resultado.success) setLista(lista.filter((u) => u.id !== id));
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto">

        {/* BOTÓN VOLVER ATRÁS */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-full hover:border-white transition-all group"
          >
            <ArrowLeft size={16} className="text-zinc-500 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
          </Link>
        </motion.div>

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-zinc-900 pb-8">
          <div className="border-l-4 border-white pl-5">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">Usuarios</h1>
            <p className="text-zinc-500 text-[8px] md:text-[9px] font-bold tracking-[0.3em] uppercase mt-1">Gestión de Staff</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input
              type="text"
              placeholder="BUSCAR..."
              className="w-full bg-zinc-900/50 border border-zinc-800 py-3 pl-10 pr-4 rounded-full text-[10px] font-black outline-none focus:border-white transition-all uppercase tracking-widest"
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        {/* LISTADO */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtrarUsuarios.map((u, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.02 }}
                key={u.id}
                className="bg-black border border-zinc-800 p-4 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all overflow-hidden border border-zinc-800 ${u.rol === 'admin' ? 'bg-red-500 text-white' :
                    u.rol === 'barbero' ? 'bg-white text-black' :
                      'bg-zinc-800 text-zinc-600'
                    }`}>
                    {u.img || u.perfilBarbero?.img ? (
                      <img src={u.img || u.perfilBarbero?.img || ""} alt={u.nombre} className="w-full h-full object-cover" />
                    ) : (
                      u.rol === 'admin' ? <Shield size={18} /> : u.rol === 'barbero' ? <Scissors size={18} /> : <User size={18} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xs md:text-sm uppercase tracking-tight truncate">{u.nombre}</h3>
                    <p className="text-[9px] md:text-[10px] text-zinc-600 font-bold lowercase truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-zinc-900 md:border-none pt-3 md:pt-0">
                  <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${u.rol === 'admin' ? 'bg-red-500/10 text-red-500' :
                    u.rol === 'barbero' ? 'bg-white/10 text-white' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>{u.rol}</span>

                  <div className="flex gap-2">
                    {u.email !== 'cubasamuel852@gmail.com' ? (
                      <>
                        <button
                          disabled={loadingId === u.id}
                          onClick={() => {
                            const nRol = u.rol === 'barbero' ? 'cliente' : 'barbero';
                            setConfirmModal({ show: true, tipo: "rol", id: u.id, nombre: u.nombre, nuevoRol: nRol });
                          }}
                          className={`h-10 px-5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${u.rol === 'barbero'
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                            : 'bg-zinc-800 text-white hover:bg-white hover:text-black'
                            }`}
                        >
                          {loadingId === u.id ? <Loader2 className="animate-spin" size={12} /> : (u.rol === 'barbero' ? 'Quitar Rango' : 'Hacer Barbero')}
                        </button>
                        <button
                          disabled={loadingId === u.id}
                          onClick={() => setConfirmModal({ show: true, tipo: "eliminar", id: u.id, nombre: u.nombre })}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[7px] font-black uppercase text-zinc-800 tracking-widest px-4">Protegido</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* MODAL DE CONFIRMACIÓN CON ESTILO */}
        <AnimatePresence>
          {confirmModal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-sm relative z-10 shadow-2xl"
              >
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${confirmModal.tipo === 'eliminar' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {confirmModal.tipo === 'eliminar' ? <Trash2 size={24} /> : <AlertCircle size={24} />}
                  </div>

                  <h2 className="text-xl font-black uppercase tracking-tighter mb-2">
                    {confirmModal.tipo === 'eliminar' ? '¿Eliminar Usuario?' : '¿Cambiar Rango?'}
                  </h2>

                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 px-4">
                    {confirmModal.tipo === 'eliminar'
                      ? `Estas a punto de eliminar a ${confirmModal.nombre.toUpperCase()}. Esta acción no se puede deshacer.`
                      : `¿Confirmas que deseas cambiar el rango de ${confirmModal.nombre.toUpperCase()} a ${confirmModal.nuevoRol?.toUpperCase()}?`}
                  </p>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                      className="flex-1 bg-zinc-800 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={procesarAccion}
                      className={`flex-1 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all ${confirmModal.tipo === 'eliminar' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}