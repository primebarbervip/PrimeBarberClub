"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import UserSidebar from "./components/UserSidebar";
import LiquidGlassHero from "./components/LiquidGlassHero";

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
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      {/* User Sidebar */}
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName || ""}
        userEmail={userEmail || ""}
        userImg={userImg || ""}
      />

      {/* Floating Warning Toast */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl" />
              <div className="relative flex items-center gap-3 px-6 py-3">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                  Necesitas iniciar sesión para reservar
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero - Full screen with login circle */}
      <LiquidGlassHero
        onReservar={handleReservaClick}
        userName={userName}
        userImg={userImg}
        onSidebarOpen={() => setSidebarOpen(true)}
      />
    </div>
  );
}
