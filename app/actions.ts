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
    
    // Obtener datos de la cita antes de actualizar
    const cita = await prisma.cita.findUnique({
      where: { id },
      include: {
        cliente: true,
        servicio: true,
        barbero: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!cita) {
      return { error: "Cita no encontrada" };
    }

    // Actualizar estado
    await prisma.cita.update({
      where: { id },
      data: { estado: nuevoEstado },
    });

    // Si se confirma, enviar email
    if (nuevoEstado === "CONFIRMADA" && cita.cliente.email) {
      const { enviarTicketReserva } = await import('./lib/email');
      
      const fecha = new Date(cita.fecha);
      const fechaFormato = fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const emailHTML = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 3px;">PRIME BARBER</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">✂ Club</p>
          </div>

          <!-- Content -->
          <div style="padding: 50px 40px; color: #fff;">
            <!-- Greeting -->
            <h2 style="color: #fff; font-size: 24px; margin: 0 0 10px 0; font-weight: 700;">¡Reserva Confirmada!</h2>
            <p style="color: #bbb; margin: 0 0 40px 0; font-size: 14px;">Tu cita ha sido confirmada exitosamente</p>

            <!-- Confirmation Card -->
            <div style="background: rgba(255,255,255,0.05); border: 2px solid #10b981; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
              <table style="width: 100%; text-align: left;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Cliente</span>
                    <p style="color: #fff; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${cita.cliente.nombre}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Servicio</span>
                    <p style="color: #fff; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${cita.servicio.nombre}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Fecha</span>
                    <p style="color: #fff; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${fechaFormato}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Hora</span>
                    <p style="color: #fff; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${cita.hora}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Duración</span>
                    <p style="color: #fff; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${cita.servicio.duracion} min</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Precio</span>
                    <p style="color: #10b981; margin: 5px 0 0 0; font-size: 18px; font-weight: 700;">Bs. ${cita.servicio.precio}</p>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Barbero Info -->
            <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Tu Barbero</p>
              <p style="color: #10b981; font-size: 18px; font-weight: 700; margin: 8px 0 0 0;">${cita.barbero?.usuario?.nombre || cita.barbero.nombre}</p>
            </div>

            <!-- Tips -->
            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
              <p style="color: #bbb; margin: 0 0 15px 0; font-size: 13px; line-height: 1.6;">
                ✓ Llega 5-10 minutos antes<br/>
                ✓ Trae tu teléfono de contacto<br/>
                ✓ Si necesitas cambiar, avisa con anticipación
              </p>
            </div>


          <!-- Bottom footer -->
          <div style="background: rgba(0,0,0,0.3); padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #666; margin: 0; font-size: 11px; letter-spacing: 1px;">© PRIME BARBER CLUB 2026 | Experiencia Premium en Cortes</p>
          </div>
        </div>
      `;

      try {
        await enviarTicketReserva(
          cita.cliente.email,
          cita.barbero?.usuario?.nombre || cita.barbero.nombre || "Prime Barber",
          emailHTML
        );
        console.log("📧 Email de confirmación enviado a:", cita.cliente.email);
      } catch (emailError) {
        console.error("⚠️ Error enviando email:", emailError);
        // No fallar la actualización si el email falla
      }
    }

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

    // Campos de Información General
    const direccion = formData.get("direccion")?.toString() || "";
    const googleMapsUrl = formData.get("googleMapsUrl")?.toString() || "";
    const nombreTienda = formData.get("nombreTienda")?.toString() || "";
    const telefono = formData.get("telefono")?.toString() || "";
    let logo = formData.get("logo")?.toString() || "";

    // Campos de Identidad Web
    const webNombre = formData.get("webNombre")?.toString() || "";
    let webLogo = formData.get("webLogo")?.toString() || "";

    // MANEJO DE ARCHIVO (LOGO GENERAL) - CON CLOUDINARY
    const logoFile = formData.get("logoFile") as File | null;
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      logo = await uploadToCloudinary(buffer, "config");
    }

    // MANEJO DE ARCHIVO (WEB LOGO) - CON CLOUDINARY
    const webLogoFile = formData.get("webLogoFile") as File | null;
    if (webLogoFile && webLogoFile.size > 0) {
      const bytes = await webLogoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      webLogo = await uploadToCloudinary(buffer, "config");
    }

    // Preparar objeto de actualización (solo actualizar campos que no sean vacíos)
    const updateData: any = {};
    if (direccion) updateData.direccion = direccion;
    if (googleMapsUrl) updateData.googleMapsUrl = googleMapsUrl;
    if (nombreTienda) updateData.nombreTienda = nombreTienda;
    if (telefono) updateData.telefono = telefono;
    if (logo) updateData.logo = logo;
    if (webNombre) updateData.webNombre = webNombre;
    if (webLogo) updateData.webLogo = webLogo;

    await (prisma as any).configuracion.upsert({
      where: { id: 1 },
      update: updateData,
      create: { 
        id: 1, 
        direccion, 
        googleMapsUrl, 
        nombreTienda, 
        telefono, 
        logo,
        webNombre,
        webLogo
      }
    });

    revalidatePath("/");
    revalidatePath("/reservar");
    revalidatePath("/admin/informacion");

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error en guardarConfiguracion:", error);
    return { error: error.message || "Error al guardar la configuración" };
  }
}

const defaultConfig = {
  id: 1,
  webNombre: "",
  webLogo: "",
  nombreTienda: "",
  direccion: "",
  googleMapsUrl: "",
  telefono: "",
  logo: "",
  enMantenimiento: false
};

export async function obtenerConfiguracion() {
  try {
    // FIX: Acceso defensivo por si el cliente Prisma no se ha actualizado en tiempo real
    if (!(prisma as any).configuracion) {
      console.warn("⚠️ Prisma client doesn't have 'configuracion' model yet.");
      return defaultConfig;
    }

    const config = await (prisma as any).configuracion.findUnique({
      where: { id: 1 }
    });
    return config || defaultConfig;
  } catch (error: any) {
    // Si hay error de inicialización de Prisma o DATABASE_URL no configurado,
    // devolvemos un objeto default en lugar de null para que el app siga funcionando
    return defaultConfig;
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
    revalidatePath("/admin/informacion");

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function limpiarBaseDeDatos() {
  try {
    console.log("⚠️ INICIANDO RESET COMPLETO DE BASE DE DATOS...");

    // IMPORTANTE: El orden importa debido a las relaciones entre tablas
    
    // 1. Borrar todas las citas (dependen de usuario, barbero y servicio)
    await prisma.cita.deleteMany({});
    console.log("✅ Citas eliminadas");

    // 2. Borrar todos los horarios especiales (dependen de barbero)
    await prisma.horarioEspecial.deleteMany({});
    console.log("✅ Horarios especiales eliminados");

    // 3. Borrar todos los servicios (dependen de barbero)
    await prisma.servicio.deleteMany({});
    console.log("✅ Servicios eliminados");

    // 4. Borrar todos los barberos (dependen de usuario)
    await prisma.barbero.deleteMany({});
    console.log("✅ Barberos eliminados");

    // 5. Borrar TODOS los usuarios (clientes, barberos, admin)
    await prisma.usuario.deleteMany({});
    console.log("✅ Usuarios eliminados");

    console.log("✅ RESET COMPLETADO - Base de datos limpia");
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/barbero");
    revalidatePath("/reservar");
    revalidatePath("/reservas");
    revalidatePath("/login");
    revalidatePath("/registro");

    return { success: true };
  } catch (error: any) {
    console.error("❌ ERROR AL RESETEAR BD:", error);
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
