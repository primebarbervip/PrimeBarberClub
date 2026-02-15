import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditarServicioClient from "./EditarServicioClient";

export default async function EditarServicioPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId || userRole !== "barbero") {
        redirect("/");
    }

    const barbero = await prisma.barbero.findFirst({
        where: { usuarioId: userId },
    });

    if (!barbero) {
        redirect("/");
    }

    const servicio = await prisma.servicio.findUnique({
        where: { id: parseInt(id) },
    });

    if (!servicio || servicio.barberoId !== barbero.id) {
        redirect("/barbero");
    }

    const servicioFormateado = {
        ...servicio,
        precio: Number(servicio.precio),
    };

    const serviciosExistentes = (await prisma.servicio.findMany({
        where: {
            barberoId: barbero.id,
            esCombo: false,
            id: { not: servicio.id } // Evitar auto-referencia si por error el servicio actual no está marcado como combo
        },
        select: {
            id: true,
            nombre: true,
            precio: true,
            duracion: true
        }
    })).map(s => ({
        ...s,
        precio: Number(s.precio)
    }));

    return <EditarServicioClient barberoId={barbero.id} servicio={servicioFormateado} serviciosExistentes={serviciosExistentes} />;
}
