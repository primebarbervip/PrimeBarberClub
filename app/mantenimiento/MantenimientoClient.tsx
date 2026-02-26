"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Calendar, Clock, Scissors, User as UserIcon, LogOut, X } from "lucide-react";
import { useState } from "react";

export default function MantenimientoClient({ usuario, reservas }: { usuario: any, reservas: any[] }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        // Clear cookies manually to handle logout on the client
        document.cookie = "user_id=; max-age=0; path=/";
        document.cookie = "user_role=; max-age=0; path=/";
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
            {/* Fondo Decorativo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />
            </div>

            {/* Click-outside listener overlay */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDropdown(false)}
                        className="fixed inset-0 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Avatar Dropdown in Top Right */}
            {usuario && (
                <div className="absolute top-6 right-6 z-50">
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-12 h-12 rounded-full border-2 border-white/10 bg-zinc-900 overflow-hidden hover:border-white/30 transition-all shadow-2xl flex items-center justify-center active:scale-95"
                        >
                            {usuario.img && usuario.img !== "DELETE" ? (
                                <img src={usuario.img} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-black text-white">{usuario.nombre?.charAt(0).toUpperCase()}</span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-64 bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/5 flex items-start justify-between">
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-white truncate">{usuario.nombre}</p>
                                            <p className="text-[10px] text-zinc-500 truncate mt-1">{usuario.email}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowDropdown(false)}
                                            className="p-1.5 -mr-1 -mt-1 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-xl w-full text-center space-y-12"
            >
                {/* Icono de Estado */}
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-full blur-2xl"
                        />
                        <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-2xl">
                            <ShieldAlert size={40} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Texto Principal */}
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                        Mejorando la <span className="text-zinc-500">Experiencia</span>
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md mx-auto">
                        Estamos realizando ajustes técnicos para brindarte un servicio de mayor nivel.
                    </p>
                </div>

                {/* Tarjeta de Información e Historial de Citas */}
                {usuario && (
                    <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-left border-b border-white/5 pb-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                                <Calendar size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tus Servicios</p>
                                <p className="text-sm font-bold text-white leading-tight mt-1">
                                    Aquí tienes tus citas <span className="text-emerald-500">activas</span>.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar text-left">
                            {reservas && reservas.length > 0 ? (
                                reservas.map((res) => {
                                    const isCancelled = res.estado.toLowerCase() === "cancelada";
                                    return (
                                        <div key={res.id} className={`p-5 bg-black/40 rounded-2xl border border-white/5 transition-colors hover:border-white/10 ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-sm font-black text-white px-1 tracking-tight">{res.servicio.nombre}</h3>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${res.estado === 'confirmada' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    res.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {res.estado}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest px-1">
                                                <div className="flex items-center gap-1.5 text-emerald-400">
                                                    <Calendar size={12} />
                                                    {new Date(res.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-zinc-400">
                                                    <Clock size={12} />
                                                    {res.hora}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-zinc-400">
                                                    <UserIcon size={12} />
                                                    {res.barbero.usuario.nombre}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6">
                                    <Scissors size={24} className="mx-auto text-zinc-600 mb-3" />
                                    <p className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">No tienes citas activas</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
                        BarberShop Prime · Elite System
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
