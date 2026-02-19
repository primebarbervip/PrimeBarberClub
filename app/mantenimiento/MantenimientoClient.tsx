"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Calendar, Clock, Scissors } from "lucide-react";
import ReservasClient from "../reservas/ReservasClient";
import ProfileClient from "../perfil/ProfileClient";
import { useState } from "react";

export default function MantenimientoClient({ usuario }: { usuario: any }) {
    const [tab, setTab] = useState("reservas");

    if (!usuario) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/40 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 max-w-xl w-full text-center space-y-12"
                >
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

                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                            Mejorando la <span className="text-zinc-500">Experiencia</span>
                        </h1>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md mx-auto">
                            Estamos realizando ajustes técnicos para brindarte un servicio de mayor nivel.
                        </p>
                    </div>

                    <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-left border-b border-white/5 pb-6">
                            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                                <Calendar size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aviso Importante</p>
                                <p className="text-sm font-bold text-white leading-tight">
                                    Tus reservas confirmadas <span className="text-emerald-500">seguirán activas</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
                            BarberShop Prime · Elite System
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-center gap-3 text-amber-500 shrink-0 sticky top-0 z-50 backdrop-blur-md">
                <ShieldAlert size={18} />
                <span className="text-xs font-black uppercase tracking-widest text-center">Software en Mantenimiento - Modo Lectura</span>
            </div>

            <div className="flex items-center justify-center gap-2 py-4 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-md sticky top-[46px] z-40">
                <button
                    onClick={() => setTab("reservas")}
                    className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${tab === "reservas" ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                >
                    Mis Citas
                </button>
                <button
                    onClick={() => setTab("perfil")}
                    className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${tab === "perfil" ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                >
                    Mi Perfil
                </button>
            </div>

            <div className="flex-1 overflow-auto relative">
                {tab === "reservas" ? (
                    <div className="[&>div]:min-h-full [&>div]:pt-8">
                        <ReservasClient />
                    </div>
                ) : (
                    <div className="pt-8">
                        <ProfileClient usuario={usuario} />
                    </div>
                )}
            </div>
        </div>
    );
}
