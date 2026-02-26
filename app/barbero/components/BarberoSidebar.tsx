"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scissors,
    UserCog,
    LogOut,
    Menu,
    X,
    PanelLeftClose,
    User,
    Calendar
} from "lucide-react";

type Usuario = {
    nombre: string;
    img: string | null;
    perfilBarbero: {
        img: string | null;
    } | null;
} | null;

export default function BarberoSidebar({ usuario }: { usuario: Usuario }) {
    const [isOpen, setIsOpen] = useState(false); // Mobile state
    const [isExpanded, setIsExpanded] = useState(false); // Desktop state
    const pathname = usePathname();

    const links = [
        { name: "Mis Servicios", href: "/barbero", icon: Scissors },
        { name: "Reservas", href: "/barbero/reservas", icon: Calendar },
        { name: "Calendarios", href: "/barbero/calendario", icon: Calendar },
    ];

    const handleLogout = () => {
        localStorage.clear();
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/";
    };

    return (
        <>
            {/* MOBILE TRIGGER (Floating Button) */}
            <div className="md:hidden fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-3 bg-zinc-900 rounded-full text-white shadow-xl active:scale-90 transition-all"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* MOBILE DRAWER (70% WIDTH FROM RIGHT) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 md:hidden"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 z-50 w-[70%] bg-zinc-900/40 backdrop-blur-lg p-6 flex flex-col md:hidden shadow-2xl will-change-transform"
                        >
                            <div className="flex justify-between items-center mb-8 pb-4">
                                <span className="text-sm font-black tracking-widest uppercase">Staff</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-4">
                                {links.map((link) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-4 text-sm font-bold uppercase tracking-wider p-3 rounded-xl transition-all ${isActive ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
                                        >
                                            <Icon size={18} />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                                {/* Profile Section - Mobile */}
                                <Link
                                    href="/barbero/perfil"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 hover:bg-white/5 rounded-xl p-3 -mx-1 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                        {usuario?.img || usuario?.perfilBarbero?.img ? (
                                            <img
                                                src={usuario.img || usuario.perfilBarbero?.img || ""}
                                                alt={usuario?.nombre || "Usuario"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={18} className="text-zinc-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black uppercase tracking-wider text-white truncate">
                                            {usuario?.nombre || "Barbero"}
                                        </p>
                                    </div>
                                </Link>

                                {/* Logout Button - Mobile */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-300"
                                >
                                    <LogOut size={16} /> Cerrar Sesión
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR (RIGHT SIDE) - COLLAPSIBLE */}
            <motion.aside
                initial={{ width: "5rem" }}
                animate={{ width: isExpanded ? "18rem" : "5rem" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:flex fixed right-0 top-0 bottom-0 flex-col bg-zinc-900/30 backdrop-blur-xl z-40 shadow-2xl overflow-hidden"
            >
                {/* HEADER: TOGGLE + TITLE */}
                <div className="h-20 flex items-center px-3 mb-2 shrink-0">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-14 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors shrink-0"
                    >
                        <PanelLeftClose size={22} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                        <h1 className="text-xl font-black tracking-[0.2em] text-white leading-none">PRIME</h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-1">Staff Panel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1 px-3 mt-4">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center h-12 rounded-xl transition-all relative overflow-hidden ${isActive
                                    ? "bg-white/10 text-white shadow-lg shadow-white/5"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {/* FIXED WIDTH ICON CONTAINER - PREVENTS JUMPS */}
                                <div className="w-14 h-full flex items-center justify-center shrink-0">
                                    <Icon size={22} />
                                </div>

                                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                                    <span className="text-sm tracking-wider font-bold ml-1">{link.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4">
                    {/* PROFILE PHOTO + LOGOUT */}
                    <div className={`flex flex-col gap-3 ${isExpanded ? "items-start" : "items-center"}`}>
                        {/* Profile Photo + Name (clickeable to profile) */}
                        <Link
                            href="/barbero/perfil"
                            className={`flex items-center gap-3 hover:bg-white/5 rounded-xl p-2 -m-2 transition-all w-full ${isExpanded ? "" : "justify-center"}`}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                {usuario?.img || usuario?.perfilBarbero?.img ? (
                                    <img
                                        src={usuario.img || usuario.perfilBarbero?.img || ""}
                                        alt={usuario?.nombre || "Usuario"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={18} className="text-zinc-500" />
                                )}
                            </div>

                            {/* User Name (always visible when expanded) */}
                            {isExpanded && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-wider text-white truncate">
                                        {usuario?.nombre || "Barbero"}
                                    </p>
                                </div>
                            )}
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2 text-red-500/80 hover:text-red-500 transition-colors ${isExpanded ? "w-full justify-start" : "justify-center"}`}
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                            {isExpanded && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Salir</span>}
                        </button>
                    </div>
                </div>
            </motion.aside >
        </>
    );
}
