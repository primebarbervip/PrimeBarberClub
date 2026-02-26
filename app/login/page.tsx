"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, X } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => { window.location.replace("/"); }, 400);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user_id", data.usuario.id);
        localStorage.setItem("user_name", data.usuario.nombre);
        localStorage.setItem("user_email", data.usuario.email);
        localStorage.setItem("user_img", data.usuario.img || "");
        window.location.href = data.redirectTo;
      } else {
        if (data.unverified) {
          window.location.href = `/verificar?email=${encodeURIComponent(email.toLowerCase().trim())}`;
          return;
        }
        setError(data.error || "Credenciales incorrectas");
        setLoading(false);
      }
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      {/* Background Image - Same as main page */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-barbershop.jpg"
          alt="Interior de barbería premium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/90" />
      </div>
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={handleClose} />
      <AnimatePresence>
        {isVisible && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-white/[0.04] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/[0.08] w-full max-w-md shadow-2xl relative z-10"
          >
            <button onClick={handleClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={20} /></button>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extralight text-white tracking-widest uppercase">Prime</h1>
              <p className="text-muted-foreground text-[10px] mt-2 uppercase tracking-[0.2em] font-medium">Acceso Privado</p>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-[10px] mb-6 text-center font-bold uppercase tracking-widest">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Correo electrónico" className="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-foreground outline-none focus:border-accent transition-all text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Contraseña" className="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-foreground outline-none focus:border-accent transition-all text-sm pr-12" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-2xl mt-4 hover:bg-zinc-200 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Sesión"}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-white/70 text-[10px] uppercase tracking-widest font-bold">
              ¿No tienes cuenta? <Link href="/registro" className="text-white hover:underline ml-2">Regístrate aquí</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
