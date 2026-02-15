"use client";

import { useEffect } from "react";

export default function BloqueoAtras() {
  useEffect(() => {
    // Empujamos el estado actual para que siempre haya algo a donde "volver"
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Si intentan ir atrás, los empujamos de nuevo hacia adelante
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null; // No renderiza nada visualmente
}