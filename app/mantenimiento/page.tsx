import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";
import MantenimientoClient from "./MantenimientoClient";

export const metadata = {
    title: "Mantenimiento temporal - BarberShop Prime",
    description: "Sitio en mantenimiento técnico.",
};

export default async function MantenimientoPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    let usuario = null;
    if (userId) {
        usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true,
                bio: true,
                img: true,
            }
        });
    }

    return <MantenimientoClient usuario={usuario} />;
}
