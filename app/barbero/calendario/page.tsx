import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CalendarioClient from "./CalendarioClient";

export default async function CalendarioPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (userRole !== "barbero" || !userId) {
        redirect("/login");
    }

    const barbero = await prisma.barbero.findUnique({
        where: { usuarioId: userId },
        include: {
            horariosEspeciales: true,
            citas: {
                include: {
                    cliente: {
                        select: {
                            nombre: true
                        }
                    }
                }
            }
        }
    });

    if (!barbero) {
        redirect("/login");
    }

    return <CalendarioClient barbero={barbero} />;
}
