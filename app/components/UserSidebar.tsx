"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    LogOut,
    User,
    Calendar,
    Home,
    Settings,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    userImg?: string;
}

export default function UserSidebar({ isOpen, onClose, userName, userEmail, userImg }: UserSidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.clear();
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/";
    };

    const links = [
        { name: "Inicio", href: "/", icon: Home },
        { name: "Mis Reservas", href: "/reservas", icon: Calendar },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-transparent"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[110] w-[70%] max-w-xs bg-zinc-900/40 backdrop-blur-xl shadow-2xl flex flex-col pt-10"
                    >
                        {/* Header Label */}
                        <div className="px-8 flex justify-between items-center mb-10 text-white/90">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">CLIENTE</span>
                            <button
                                onClick={onClose}
                                className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-all shadow-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 px-4 space-y-2">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-5 p-5 rounded-2xl transition-all ${isActive
                                                ? "bg-white text-black shadow-lg"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95"
                                            }`}
                                    >
                                        <div className={`shrink-0 transition-colors ${isActive ? "text-black" : "text-zinc-500 group-hover:text-white"}`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Divider - Positioned lower to match screenshot */}
                        <div className="px-6 mt-20 mb-6">
                            <div className="h-[1px] bg-white/10 w-full" />
                        </div>

                        {/* Bottom Section: Profile & Logout */}
                        <div className="px-8 pb-12 space-y-10">
                            {/* User Profile Info - Cleaned up to match staff style */}
                            <Link
                                href="/perfil"
                                onClick={onClose}
                                className="flex items-center gap-4 hover:bg-white/5 p-2 -mx-2 rounded-2xl transition-all group"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/20">
                                    {userImg ? (
                                        <img src={userImg} alt={userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-black text-white">{userName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h2 className="text-[15px] font-black text-white tracking-widest truncate uppercase leading-none">
                                        {userName}
                                    </h2>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 text-red-500 hover:text-red-400 transition-colors group"
                            >
                                <LogOut size={20} />
                                <span className="text-[12px] font-black tracking-[0.2em] uppercase">Cerrar Sesión</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
