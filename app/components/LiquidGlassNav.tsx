"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { useState, useEffect } from "react";

interface LiquidGlassNavProps {
  userName: string | null;
  userImg: string | null;
  onSidebarOpen: () => void;
}

export default function LiquidGlassNav({ userName, userImg, onSidebarOpen }: LiquidGlassNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
              scrolled ? "shadow-2xl shadow-black/20" : ""
            }`}
          >
            {/* Glass background */}
            <div
              className={`absolute inset-0 transition-all duration-500 rounded-2xl ${
                scrolled
                  ? "bg-[#0a0a0a]/70 backdrop-blur-xl border border-white/[0.08]"
                  : "bg-transparent"
              }`}
            />
            {/* Top edge highlight */}
            {scrolled && (
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            <div className="relative flex items-center justify-between px-6 py-3">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <span className="text-lg font-extralight tracking-[0.3em] text-white">
                  PRIME
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#c9a96e]">
                  Club
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#servicios"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                  Servicios
                </a>
                <a
                  href="#"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                  Nosotros
                </a>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                {userName ? (
                  <button
                    onClick={onSidebarOpen}
                    className="group relative"
                  >
                    <div className="absolute -inset-2 bg-[#c9a96e]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 group-hover:border-[#c9a96e]/30 transition-all flex items-center justify-center">
                      {userImg ? (
                        <img
                          src={userImg}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="relative px-6 py-2.5 rounded-xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] rounded-xl group-hover:bg-white/[0.1] transition-all" />
                    <span className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      Ingresar
                    </span>
                  </Link>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
                  aria-label="Menú"
                >
                  {mobileMenuOpen ? (
                    <X className="w-4 h-4 text-white" />
                  ) : (
                    <Menu className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-6 right-6 z-40 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl" />
            <div className="relative p-6 flex flex-col gap-4">
              <a
                href="#servicios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors py-2"
              >
                Servicios
              </a>
              <a
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors py-2"
              >
                Nosotros
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
