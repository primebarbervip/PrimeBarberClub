"use server";

// CORRECCIÓN: Usamos ruta relativa para evitar errores de compilación
import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { join } from "node:path";

// Force refresh: Prisma Client actualizado tras generación manual

export async function guardarServicio(formData: FormData) {
  console.log("🛠️ INICIANDO Server Action: guardarServicio");

  try {
    // 1. Extraer datos
    const id = formData.get("id");
    const nombre = formData.get("nombre")?.toString();
    const precioRaw = formData.get("precio");
    const duracionRaw = formData.get("duracion");
    const descripcion = formData.get("descripcion")?.toString();
    const categoria = formData.get("categoria")?.toString();
    const barberoIdRaw = formData.get("barberoId"); // FIX: Missing extraction

    // NUEVO: Capturamos los IDs de servicios incluidos en el combo
    const serviciosIdsRaw = formData.get("serviciosIds");
    const serviciosIds = serviciosIdsRaw
      ? serviciosIdsRaw.toString().split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
      : [];

    console.log("📥 Datos recibidos:", { id, nombre, precioRaw, duracionRaw, categoria, barberoIdRaw, serviciosIds });

    // 2. Conversión de tipos
    const precio = precioRaw ? parseFloat(precioRaw.toString()) : 0;
    const duracion = duracionRaw ? parseInt(duracionRaw.toString()) : 0;
    const barberoId = barberoIdRaw ? parseInt(barberoIdRaw.toString()) : null;

    // 3. Validación
    if (!nombre || !nombre.trim()) {
      return { error: "El nombre es obligatorio" };
    }
    if (isNaN(precio) || precio <= 0) {
      return { error: "El precio debe ser mayor a 0" };
    }

    const esCombo = categoria === "combo";

    // 4. Operación en Base de Datos
    if (id) {
      // --- ACTUALIZAR ---
      console.log("🔄 Actualizando servicio ID:", id);
      await prisma.servicio.update({
        where: { id: parseInt(id.toString()) },
        data: {
          nombre,
          precio,
          duracion,
          descripcion,
          esCombo,
          // Mantenemos o actualizamos el barbero si es necesario
          ...(barberoId && { barberoId }),
          // Actualizar relaciones de combo
          serviciosIncluidos: {
            set: [], // Primero desconectamos todo (estrategia simple)
            connect: serviciosIds.map(sid => ({ id: sid })) // Luego conectamos los nuevos
          }
        },
      });
    } else {
      // --- CREAR ---
      console.log("✨ Creando nuevo servicio para barbero:", barberoId);
      await prisma.servicio.create({
        data: {
          nombre,
          precio,
          duracion,
          descripcion: descripcion || "",
          esCombo,
          // Vinculamos el servicio al barbero logueado
          barberoId: barberoId,
          // Relaciones iniciales si es combo
          serviciosIncluidos: {
            connect: serviciosIds.map(sid => ({ id: sid }))
          }
        },
      });
    }

    console.log("✅ Operación Exitosa en BD");

    // 5. Refrescar todas las rutas que dependen de estos datos
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/barbero");

    return { success: true };

  } catch (error: any) {
    console.error("🚨 ERROR CRÍTICO EN SERVIDOR:", error);
    // Verificar si es un error de Prisma
    if (error.code) {
      return { error: `Error de base de datos: ${error.code} - ${error.message}` };
    }
    return { error: error.message || "Hubo un error desconocido al guardar." };
  }
}

export async function eliminarServicio(id: number) {
  try {
    console.log("🗑️ Eliminando servicio ID:", id);
    await prisma.servicio.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar:", error);
    return { error: "No se pudo eliminar" };
  }
}
export async function actualizarEstadoCita(id: number, nuevoEstado: string) {
  try {
    console.log("📅 Actualizando estado de cita:", id, "a", nuevoEstado);
    await prisma.cita.update({
      where: { id },
      data: { estado: nuevoEstado },
    });

    revalidatePath('/barbero');
    return { success: true };
  } catch (error) {
    console.error('Error actualizando cita:', error);
    return { error: "No se pudo actualizar la cita" };
  }
}


export async function actualizarHorario(formData: FormData) {
  try {
    const barberoId = parseInt(formData.get("barberoId") as string);
    const fecha = formData.get("fecha") as string; // Opcional
    const inicioJornada = formData.get("inicioJornada") as string;
    const finJornada = formData.get("finJornada") as string;
    const inicioAlmuerzo = formData.get("inicioAlmuerzo") as string;
    const finAlmuerzo = formData.get("finAlmuerzo") as string;
    const cerrado = formData.get("cerrado") === "true";
    const almuerzoActivo = formData.get("almuerzoActivo") === "true";
    const bloqueosRaw = formData.get("bloqueos") as string;
    const bloqueos = bloqueosRaw ? bloqueosRaw.split(",") : [];
    const habilitadosRaw = formData.get("habilitados") as string;
    const habilitados = habilitadosRaw ? habilitadosRaw.split(",") : [];

    if (!barberoId) return { error: "ID de barbero requerido" };

    if (fecha) {
      console.log(`📅 Actualizando horario ESPECIAL para ${fecha}. Bloqueos:`, bloqueos, "Habilitados:", habilitados);
      await prisma.horarioEspecial.upsert({
        where: {
          barberoId_fecha: { barberoId, fecha }
        },
        update: {
          inicioJornada: "", // Se ignora, se lee del barbero
          finJornada: "",   // Se ignora, se lee del barbero
          inicioAlmuerzo: null, // Herencia forzada para sincronía total
          finAlmuerzo: null,
          cerrado,
          bloqueos,
          habilitados
        },
        create: {
          barberoId,
          fecha,
          inicioJornada: "",
          finJornada: "",
          inicioAlmuerzo: null,
          finAlmuerzo: null,
          cerrado,
          bloqueos,
          habilitados
        }
      });
      // NUEVO: Que todo el horario se aplique a todos los días (Sincronía Total)
      console.log("📅 Actualizando HORARIOS GLOBALES:", { inicioJornada, finJornada, almuerzoActivo });
      await prisma.barbero.update({
        where: { id: barberoId },
        data: {
          inicioJornada,
          finJornada,
          inicioAlmuerzo: inicioAlmuerzo || null,
          finAlmuerzo: finAlmuerzo || null,
          almuerzoActivo
        } as any
      });
    } else {
      console.log("📅 Actualizando horario GENERAL");
      await prisma.barbero.update({
        where: { id: barberoId },
        data: {
          inicioJornada,
          finJornada,
          inicioAlmuerzo: inicioAlmuerzo || null,
          finAlmuerzo: finAlmuerzo || null,
        }
      });
    }

    revalidatePath('/barbero');
    revalidatePath('/reservar');
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error en actualizarHorario:", error);
    return { error: error.message || "Error desconocido al guardar" };
  }
}

export async function guardarConfiguracion(formData: FormData) {
  try {
    // FIX: Acceso defensivo por si el cliente Prisma no se ha actualizado en tiempo real
    if (!(prisma as any).configuracion) {
      return { error: "El sistema aún se está actualizando. Por favor, reinicia el servidor o espera unos segundos." };
    }

    const direccion = formData.get("direccion")?.toString() || "";
    const googleMapsUrl = formData.get("googleMapsUrl")?.toString() || "";
    const nombreTienda = formData.get("nombreTienda")?.toString() || "";
    const telefono = formData.get("telefono")?.toString() || "";
    let logo = formData.get("logo")?.toString() || "";

    // MANEJO DE ARCHIVO (LOGO) - AHORA CON CLOUDINARY
    const logoFile = formData.get("logoFile") as File | null;
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a Cloudinary en la carpeta 'config'
      logo = await uploadToCloudinary(buffer, "config");
    }

    await (prisma as any).configuracion.upsert({
      where: { id: 1 },
      update: { direccion, googleMapsUrl, nombreTienda, telefono, logo },
      create: { id: 1, direccion, googleMapsUrl, nombreTienda, telefono, logo }
    });

    revalidatePath("/");
    revalidatePath("/reservar");
    revalidatePath("/admin/configuracion");

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error en guardarConfiguracion:", error);
    return { error: error.message || "Error al guardar la configuración" };
  }
}

export async function obtenerConfiguracion() {
  try {
    // FIX: Acceso defensivo por si el cliente Prisma no se ha actualizado en tiempo real
    if (!(prisma as any).configuracion) {
      console.warn("⚠️ Prisma client doesn't have 'configuracion' model yet.");
      return {
        id: 1,
        nombreTienda: "",
        direccion: "",
        googleMapsUrl: "",
        telefono: "",
        logo: ""
      };
    }

    const config = await (prisma as any).configuracion.findUnique({
      where: { id: 1 }
    });
    return config || {
      id: 1,
      nombreTienda: "",
      direccion: "",
      googleMapsUrl: "",
      telefono: "",
      logo: "",
      enMantenimiento: false
    };
  } catch (error) {
    console.error("❌ Error en obtenerConfiguracion:", error);
    return null;
  }
}

export async function toggleMantenimiento(valor: boolean) {
  try {
    if (!(prisma as any).configuracion) return { error: "Error de sincronía" };

    await (prisma as any).configuracion.upsert({
      where: { id: 1 },
      update: { enMantenimiento: valor },
      create: { id: 1, enMantenimiento: valor }
    });

    const cookieStore = await cookies();
    if (valor) {
      cookieStore.set("mantenimiento_activo", "true", {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 días
      });
    } else {
      cookieStore.delete("mantenimiento_activo");
    }

    revalidatePath("/");
    revalidatePath("/reservar");
    revalidatePath("/admin/configuracion");

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function limpiarBaseDeDatos() {
  try {
    console.log("⚠️ INICIANDO LIMPIEZA DE BASE DE DATOS...");

    // 1. Borrar todas las citas
    await prisma.cita.deleteMany({});

    // 2. Borrar todos los usuarios que sean 'cliente'
    // Mantenemos admin y barbero intactos
    await prisma.usuario.deleteMany({
      where: {
        rol: "cliente"
      }
    });

    console.log("✅ LIMPIEZA COMPLETADA");
    revalidatePath("/admin");
    revalidatePath("/barbero");
    revalidatePath("/reservar");

    return { success: true };
  } catch (error: any) {
    console.error("❌ ERROR AL LIMPIAR BD:", error);
    return { error: error.message };
  }
}

export async function verificarSesion() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const cookieRole = cookieStore.get("user_role")?.value;

    if (!userId) return { loggedIn: false };

    // Consultar el rol actual en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true }
    });

    if (!usuario) {
      // El usuario ya no existe, limpiamos sesión por seguridad
      cookieStore.delete("user_id");
      cookieStore.delete("user_role");
      return { roleChanged: true, userId: null };
    }

    if (usuario.rol !== cookieRole) {
      console.log(`🔄 Sincronizando rol para ${userId}: ${cookieRole} -> ${usuario.rol}`);

      // Actualizamos la cookie con el nuevo rol
      cookieStore.set("user_role", usuario.rol, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      });

      return { roleChanged: true, userId };
    }

    return { roleChanged: false, userId };
  } catch (error) {
    console.error("Error en verificarSesion:", error);
    return { error: "Error al verificar sesión" };
  }
}
export async function cancelarReserva(id: number) {
  try {
    console.log("🚫 Cancelando cita:", id);
    await prisma.cita.update({
      where: { id },
      data: { estado: "cancelada" }
    });
    revalidatePath("/reservas");
    return { success: true };
  } catch (error) {
    console.error("Error cancelando cita:", error);
    return { error: "No se pudo cancelar la cita" };
  }
}

export async function confirmarReserva(id: number) {
  try {
    console.log("✅ Confirmando cita:", id);
    await prisma.cita.update({
      where: { id },
      data: { estado: "confirmada" }
    });
    revalidatePath("/admin/reservas");
    revalidatePath("/barbero/reservas");
    revalidatePath("/reservas");
    return { success: true };
  } catch (error) {
    console.error("Error confirmando cita:", error);
    return { error: "No se pudo confirmar la cita" };
  }
}
