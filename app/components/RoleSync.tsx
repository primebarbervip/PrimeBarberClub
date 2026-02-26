"use client";

import { useEffect } from "react";
import { verificarSesion } from "../actions";

/**
 * Componente silencioso que verifica si el rol ha cambiado en la DB
 * y refresca la página para que el middleware haga su trabajo si hay desincronía.
 */
export default function RoleSync() {
    useEffect(() => {
        const check = async () => {
            try {
                const res = await verificarSesion();
                if (res.roleChanged) {
                    console.log("⚡ Rol actualizado. Recargando para aplicar cambios...");
                    window.location.reload();
                }

                // Sincronizar userId a localStorage si falta (Fix para redirecciones en Reservas)
                if (res.userId && !localStorage.getItem("user_id")) {
                    console.log("🔄 Sincronizando userId a localStorage...");
                    localStorage.setItem("user_id", res.userId);
                }
            } catch (err) {
                // Silencioso
            }
        };

        check();
    }, []);

    return null; // No renderiza nada
}
