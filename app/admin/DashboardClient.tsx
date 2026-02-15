"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { eliminarServicio } from "../actions";
import { resetDatabase } from "../actions-admin";
import {
  Trash2, Package, Scissors, User as UserIcon, Shield, Camera, X, LogOut, RefreshCcw
} from "lucide-react";

type Servicio = {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
  esCombo: boolean;
};

type Barbero = {
  id: number;
  nombre: string;
  especialidad: string | null;
  servicios: Servicio[];
  usuario: {
    img: string | null;
    nombre: string;
  };
};

export default function DashboardClient({ barberos = [] }: { barberos: Barbero[] }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminRole, setAdminRole] = useState("Master Barber");
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false); // NUEVO

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("user_name");
      if (name) setAdminName(name);
    }
  }, []);

  // ... (navigation blocking code remains same) ...
  useEffect(() => {
    // Forzamos al historial a quedarse aquí
    const blockNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    blockNavigation();

    const handlePopState = () => {
      // Si el usuario intenta ir a una ruta que no sea admin, lo bloqueamos
      if (!window.location.pathname.startsWith('/admin')) {
        blockNavigation();
        // Redirección forzada para evitar que se quede en el login/landing
        window.location.replace('/admin');
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.replace("/");
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿ELIMINAR ESTE SERVICIO?")) {
      await eliminarServicio(id);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (r) => setTempPhoto(r.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsto eliminará TODOS los usuarios, citas y datos de barberos (excepto tu cuenta Admin).\n\nEsta acción NO se puede deshacer.")) {
      if (confirm("Confirmación final: ¿Realmente deseas borrar la base de datos?")) {
        setIsResetting(true);
        const res = await resetDatabase();
        if (res.error) {
          alert(res.error);
        } else {
          alert("Base de datos reseteada con éxito. Solo tú permaneces.");
          window.location.reload();
        }
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">

      {/* HEADER - TEXTO RECTO */}
      <header className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-white">Admin</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">Panel de Control Admin</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Icono de perfil eliminado a petición */}
        </div>
      </header>

      {/* LISTA DE SERVICIOS */}
      <section className="max-w-4xl mx-auto space-y-12 pb-24">
        {barberos.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 text-xs uppercase tracking-widest border border-dashed border-zinc-900 rounded-[3rem]">
            No hay barberos registrados. (Base de datos limpia)
          </div>
        ) : (
          barberos.map((barbero) => (
            <div key={barbero.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-2 px-2">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800">
                  {barbero.usuario?.img ? (
                    <img src={barbero.usuario.img} alt={barbero.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={14} className="text-zinc-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest">{barbero.nombre}</h2>
                  <p className="text-[8px] text-zinc-600 uppercase font-bold">{barbero.especialidad || "Estilista"}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {barbero.servicios.length === 0 ? (
                  <p className="text-[9px] text-zinc-800 uppercase font-bold px-4 py-2">Sin servicios registrados</p>
                ) : (
                  barbero.servicios.map((s) => (
                    <div key={s.id} className="bg-black border border-zinc-800 p-4 rounded-3xl flex justify-between items-center group hover:border-zinc-700 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.esCombo ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                          {s.esCombo ? <Package size={16} /> : <Scissors size={16} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-xs uppercase text-zinc-200">{s.nombre}</h3>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase">
                            {s.precio} BOB • {s.duracion} MIN
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* MODAL PERFIL */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="bg-zinc-900 border-t border-zinc-800 p-6 rounded-t-[2rem] w-full max-w-xl relative z-10 pb-8 font-sans">
              <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-6 opacity-50" />

              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Cuenta Admin</h2>
                <X onClick={() => setShowProfileModal(false)} className="cursor-pointer text-zinc-600 hover:text-white" size={20} />
              </div>

              <div className="flex items-center gap-6 mb-8 px-2">
                <div className="relative w-24 h-24">
                  <div className="w-full h-full rounded-full bg-zinc-800 border-2 border-zinc-800 overflow-hidden flex items-center justify-center">
                    {tempPhoto ? <img src={tempPhoto} className="w-full h-full object-cover" alt="Profile" /> : <UserIcon size={32} className="text-zinc-600" />}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full cursor-pointer shadow-xl">
                    <Camera size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Cuenta Maestra</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Super Admin</p>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-zinc-800"
                >
                  <LogOut size={14} /> Salir del Sistema
                </button>

                <div className="border-t border-zinc-800 my-4" />

                <button
                  onClick={handleResetDatabase}
                  disabled={isResetting}
                  className="w-full py-4 bg-red-900/10 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-900/20 transition-colors"
                >
                  {isResetting ? 'Borrando...' : (
                    <>
                      <RefreshCcw size={14} /> RESETEAR BASE DE DATOS
                    </>
                  )}
                </button>
                <p className="text-[8px] text-zinc-600 text-center font-bold uppercase px-6">
                  Advertencia: Esta acción eliminará a los 15 usuarios de prueba y citas. Solo tú (Admin) quedarás.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}