import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NuevoServicioClient from "./NuevoServicioClient";

export default async function NuevoServicioPage() {
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

    const serviciosExistentes = (await prisma.servicio.findMany({
        where: {
            barberoId: barbero.id,
            esCombo: false // Solo queremos servicios base, no otros combos (para evitar ciclos por ahora)
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

    return <NuevoServicioClient barberoId={barbero.id} serviciosExistentes={serviciosExistentes} />;
}
