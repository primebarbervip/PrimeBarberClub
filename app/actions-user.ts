"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function actualizarPerfil(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return { error: "No autorizado" };
        }

        const nombre = formData.get("nombre")?.toString();
        const telefono = formData.get("telefono")?.toString();
        const bio = formData.get("bio")?.toString();
        const img = formData.get("img")?.toString();
        // La imagen se manejaría aparte o como URL si suben a un storage, 
        // por ahora asumiremos que es un string o no lo tocamos si viene vacío.

        // Validación básica
        if (!nombre || !nombre.trim()) {
            return { error: "El nombre no puede estar vacío" };
        }

        console.log("📝 Actualizando perfil usuario:", userId);

        await prisma.usuario.update({
            where: { id: userId },
            data: {
                nombre,
                telefono,
                bio,
                ...(img === "DELETE" ? { img: null } : (img && { img })),
            },
        });

        revalidatePath("/");
        revalidatePath("/perfil");
        revalidatePath("/admin");
        revalidatePath("/admin/usuarios");
        revalidatePath("/barbero");
        return { success: true };

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return { error: "Hubo un error al guardar los cambios." };
    }
}
