"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

export async function cambiarRolUsuario(id: string, nuevoRol: string) {
  try {
    // 1. Actualizamos el rol en la tabla Usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: { rol: nuevoRol },
    });

    // 2. Si el nuevo rol es barbero, creamos o activamos su perfil profesional
    if (nuevoRol === "barbero") {
      await prisma.barbero.upsert({
        where: { usuarioId: id },
        update: {
          activo: true,
          nombre: usuarioActualizado.nombre // Sincronizamos nombre por si acaso
        },
        create: {
          usuarioId: id,
          nombre: usuarioActualizado.nombre,
          activo: true,
          especialidad: "" // Sin valor por defecto
        },
      });
    } else {
      // Si le quitamos el rango, lo desactivamos de la lista de profesionales
      await prisma.barbero.updateMany({
        where: { usuarioId: id },
        data: { activo: false }
      });
    }

    // 3. Refrescamos todas las vistas involucradas
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin");
    revalidatePath("/reservar");

    return { success: true };

  } catch (error) {
    console.error("Error al cambiar rol:", error);
    return { error: "No se pudo cambiar el rol" };
  }
}

export async function eliminarUsuario(id: string) {
  try {
    // Borrado manual para evitar conflictos de integridad
    // Primero citas donde sea cliente
    await prisma.cita.deleteMany({ where: { clienteId: id } });

    // Luego su perfil de barbero (si tiene)
    await prisma.barbero.deleteMany({ where: { usuarioId: id } });

    // Finalmente el usuario
    await prisma.usuario.delete({ where: { id } });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin");
    revalidatePath("/reservar");

    return { success: true };

  } catch (error) {
    console.error("Error al eliminar:", error);
    return { error: "No se pudo eliminar el usuario." };
  }
}

export async function resetDatabase() {
  try {
    const ADMIN_EMAIL = 'cubasamuel852@gmail.com';

    // 1. Verificar que existe el admin para no borrarlo por accidente si no estuviere
    const admin = await prisma.usuario.findUnique({
      where: { email: ADMIN_EMAIL }
    });

    if (!admin) {
      throw new Error("Admin user not found. Aborting reset to prevent total data loss.");
    }

    // 2. Eliminar todas las CITAS
    await prisma.cita.deleteMany({});

    // 3. Eliminar Barberos (TODOS, incluido el Admin si tenía perfil de barbero)
    // El usuario quiere que el Admin sea SOLO Admin, no estilista.
    await prisma.barbero.deleteMany({});

    const adminUserId = admin.id;

    // 4. Eliminar Usuarios que NO sean el Admin
    await prisma.usuario.deleteMany({
      where: {
        id: {
          not: adminUserId
        }
      }
    });

    // Opcional: Si quisieras borrar servicios también, descomenta:
    // await prisma.servicio.deleteMany({}); 

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };

  } catch (error) {
    console.error("Error resetting database:", error);
    return { error: "Error critico al resetear la base de datos." };
  }
}