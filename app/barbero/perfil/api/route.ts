import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

// 1. ESTO LEE LOS DATOS PARA QUE EL FORMULARIO NO SALGA VACÍO
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscamos al barbero por su usuarioId (el que está en la cookie)
    const barbero = await prisma.barbero.findUnique({
      where: { usuarioId: userId }
    });

    if (!barbero) {
      return NextResponse.json({ error: "Barbero no encontrado" }, { status: 404 });
    }

    return NextResponse.json(barbero);
  } catch (error) {
    console.error("ERROR AL OBTENER PERFIL:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// 2. ESTO GUARDA LOS CAMBIOS QUE HACES EN EL FORMULARIO
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const nombre = formData.get("nombre")?.toString();
    const especialidad = formData.get("especialidad")?.toString();
    const descripcion = formData.get("descripcion")?.toString();
    let img = formData.get("img")?.toString();

    // MANEJO DE IMAGEN CON CLOUDINARY
    const imageFile = formData.get("imageFile") as File | null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a Cloudinary en la carpeta 'barberos'
      img = await uploadToCloudinary(buffer, "barberos");
    }

    // Actualizamos tanto el Barbero como el Usuario para que todo esté sincronizado
    await prisma.$transaction([
      prisma.barbero.update({
        where: { usuarioId: userId },
        data: {
          nombre,
          especialidad,
          descripcion,
          img
        }
      }),
      prisma.usuario.update({
        where: { id: userId },
        data: {
          nombre,
          img
        }
      })
    ]);

    // Forzamos la revalidación de las páginas que muestran los barberos
    revalidatePath("/barbero", "layout");
    revalidatePath("/barbero");
    revalidatePath("/reservar"); // Revalidar la página de reservas para que muestre la foto actualizada

    return NextResponse.json({ success: true, img });

  } catch (error) {
    console.error("ERROR AL ACTUALIZAR PERFIL:", error);
    return NextResponse.json({ error: "Error al guardar los datos" }, { status: 500 });
  }
}
