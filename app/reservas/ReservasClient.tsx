"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    Scissors,
    User as UserIcon,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Timer,
    XCircle,
    Menu,
    AlertTriangle,
    X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cancelarReserva } from "../actions";
import UserSidebar from "../components/UserSidebar";

interface Reserva {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    barbero: {
        usuario: {
            nombre: string;
        }
    };
    servicio: {
        nombre: string;
        precio: number;
    };
}

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

// Función para obtener el estado dinámico basado en fecha/hora actual
function getEstadoDinamico(estado: string, fecha: string, hora: string): string {
    const esExpirada = esCitaExpirada(fecha, hora);
    
    // Si la fecha/hora ya pasó
    if (esExpirada) {
        if (estado.toLowerCase() === "confirmada") {
            return "completada"; // Cambiar a "Completada"
        }
        if (estado.toLowerCase() === "pendiente") {
            return "expirada"; // Cambiar a "Expirada"
        }
    }
    
    return estado;
}

export default function ReservasClient() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // User data for sidebar
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        img: ""
    });

    const fetchReservas = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            window.location.href = "/login";
            return;
        }

        // Set user data for sidebar
        setUserData({
            name: localStorage.getItem("user_name") || "",
            email: localStorage.getItem("user_email") || "",
            img: localStorage.getItem("user_img") || ""
        });

        try {
            const res = await fetch(`/api/user/reservas?userId=${userId}`);
            const data = await res.json();
            setReservas(data);
        } catch (error) {
            console.error("Error fetching reservas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
        // Refrescar reservas cada 5 segundos para detectar cambios de estado
        const interval = setInterval(fetchReservas, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmarCancelacion = async () => {
        if (!cancelingId) return;

        setIsProcessing(true);
        try {
            const res = await cancelarReserva(cancelingId);
            if (res.success) {
                await fetchReservas();
                setCancelingId(null);
            } else {
                alert(res.error || "No se pudo cancelar la cita");
            }
        } catch (error) {
            alert("Error al procesar la cancelación");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusStyles = (estado: string) => {
        switch (estado.toLowerCase()) {
            case "confirmada":
            case "confirmado":
                return {
                    bg: "bg-green-500/10",
                    text: "text-green-400",
                    border: "border-green-500/20",
                    icon: <CheckCircle2 size={12} />,
                    label: "Confirmada"
                };
            case "completada":
                return {
                    bg: "bg-blue-500/10",
                    text: "text-blue-400",
                    border: "border-blue-500/20",
                    icon: <CheckCircle2 size={12} />,
                    label: "Completada"
                };
            case "pendiente":
                return {
                    bg: "bg-amber-500/10",
                    text: "text-amber-400",
                    border: "border-amber-500/30",
                    icon: <Timer size={12} />,
                    label: "Pendiente de Confirmación"
                };
            case "expirada":
                return {
                    bg: "bg-orange-500/10",
                    text: "text-orange-400",
                    border: "border-orange-500/20",
                    icon: <XCircle size={12} />,
                    label: "Expirada"
                };
            case "cancelada":
                return {
                    bg: "bg-red-500/10",
                    text: "text-red-500",
                    border: "border-red-500/20",
                    icon: <XCircle size={12} />,
                    label: "Cancelada"
                };
            default:
                return {
                    bg: "bg-zinc-500/10",
                    text: "text-zinc-400",
                    border: "border-zinc-500/20",
                    icon: <Timer size={12} />,
                    label: estado
                };
        }
    };

    // Función para ordenar reservas por fecha más cercana
    const ordenarPorFecha = (arr: Reserva[]) => {
        return [...arr].sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaA.getTime() - fechaB.getTime();
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* User Sidebar */}
            <UserSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={userData.name}
                userEmail={userData.email}
                userImg={userData.img}
            />

            {/* Custom Cancellation Modal */}
            <AnimatePresence>
                {cancelingId !== null && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isProcessing && setCancelingId(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full relative z-10 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-500" size={32} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-2">¿Cancelar Cita?</h3>
                            <p className="text-zinc-400 text-sm mb-8">Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar tu reserva?</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirmarCancelacion}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "SÍ, CANCELAR CITA"}
                                </button>
                                <button
                                    onClick={() => setCancelingId(null)}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all"
                                >
                                    VOLVER ATRÁS
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header Area */}
            <div className="max-w-4xl mx-auto mb-12 flex justify-between items-start">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Volver</span>
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Mis Reservas</h1>
                    <p className="text-zinc-500 text-sm font-medium">Gestiona tus próximas citas y revisa su estado.</p>
                </div>

                {/* Sidebar Trigger (Hamburger Menu Style) */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-3.5 bg-zinc-900/50 backdrop-blur-xl rounded-full border border-white/5 text-white hover:bg-white/5 transition-all shadow-2xl active:scale-95 flex items-center justify-center"
                >
                    <Menu size={20} className="text-white" />
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto space-y-6">
                {reservas.length === 0 ? (
                    <div className="py-20 text-center space-y-4 bg-zinc-900/30 rounded-[2.5rem] border border-white/5">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <Calendar className="text-zinc-700" size={24} />
                        </div>
                        <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase">No tienes reservas activas</p>
                        <Link
                            href="/"
                            className="inline-block px-8 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                            Reservar Cita
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                                        {ordenarPorFecha(reservas).map((reserva) => {
                                            const estadoDinamico = getEstadoDinamico(reserva.estado, reserva.fecha, reserva.hora);
                                            const status = getStatusStyles(estadoDinamico);
                                            const isPending = reserva.estado.toLowerCase() === "pendiente" && !esCitaExpirada(reserva.fecha, reserva.hora);
                                            const isCancelled = reserva.estado.toLowerCase() === "cancelada";

                            return (
                                <motion.div
                                    key={reserva.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/10 transition-all ${isCancelled ? 'opacity-60 grayscale' : ''}`}
                                >
                                    <div className="flex items-start gap-6">
                                        {/* Date Icon */}
                                        <div className={`w-16 h-16 shrink-0 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all ${isCancelled ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black'}`}>
                                            <span className="text-[10px] font-black uppercase opacity-50">
                                                {new Date(reserva.fecha).toLocaleString('es', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-black leading-none">
                                                {new Date(reserva.fecha).getDate()}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className={`text-lg font-black tracking-tight mb-1 ${isCancelled ? 'text-zinc-500' : 'text-white'}`}>
                                                    {reserva.servicio.nombre}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 tracking-wider">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-zinc-700" />
                                                        {reserva.hora}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <UserIcon size={14} className="text-zinc-700" />
                                                        {reserva.barbero.usuario.nombre}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className={`px-4 py-1.5 rounded-full border ${status.bg} ${status.text} ${status.border} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                                                    {status.icon}
                                                    {status.label}
                                                </div>

                                                {isPending && (
                                                    <>
                                                        <span className="text-[9px] text-amber-500/70 font-semibold">Esperando confirmación del barbero...</span>
                                                        <button
                                                            onClick={() => setCancelingId(reserva.id)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors p-1 ml-auto"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 px-2 md:px-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Precio</span>
                                        <span className={`text-xl font-black ${isCancelled ? 'text-zinc-600' : 'text-white'}`}>Bs. {reserva.servicio.precio}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
