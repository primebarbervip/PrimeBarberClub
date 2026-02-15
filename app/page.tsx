"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import UserSidebar from "./components/UserSidebar";

export default function LandingPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userImg, setUserImg] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      const hasCookie = document.cookie.includes("user_role");
      const name = localStorage.getItem("user_name");
      const email = localStorage.getItem("user_email");
      const img = localStorage.getItem("user_img");

      if (hasCookie && name) {
        setUserName(name);
        setUserEmail(email);
        setUserImg(img);
      } else {
        setUserName(null);
      }
    };

    checkSession();
  }, []);

  const handleReservaClick = () => {
    if (userName) {
      router.push("/reservar");
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-center">

      {/* USER SIDEBAR COMPONENT */}
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName || ""}
        userEmail={userEmail || ""}
        userImg={userImg || ""}
      />

      {/* HEADER / NAV */}
      <nav className="absolute top-8 right-8 z-50">
        {userName ? (
          <button
            onClick={() => setSidebarOpen(true)}
            className="group relative"
          >
            {/* Pulsing effect for interaction */}
            <div className="absolute -inset-2 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-900 group-hover:border-white transition-all shadow-2xl flex items-center justify-center">
              {userImg ? (
                <img src={userImg} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-white">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </button>
        ) : (
          <Link
            href="/login"
            className="px-8 py-3 border border-zinc-800 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all font-black"
          >
            Iniciar Sesión
          </Link>
        )}
      </nav>

      {/* HERO SECTION */}
      <div className="text-center relative">
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-max flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
            >
              <AlertCircle size={14} /> Necesitas iniciar sesión para reservar
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-7xl md:text-9xl font-extralight tracking-[0.4em] -mr-[0.4em] mb-4 text-white">PRIME</h1>
        <p className="text-zinc-500 tracking-[0.5em] -mr-[0.5em] text-[10px] md:text-[12px] uppercase mb-12 font-bold">The Art of Barbering</p>

        <button
          onClick={handleReservaClick}
          className="px-14 py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl text-[11px] uppercase tracking-[0.3em]"
        >
          RESERVAR CITA
        </button>
      </div>
    </div>
  );
}