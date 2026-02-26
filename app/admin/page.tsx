import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value;

  // SEGURIDAD
  if (userRole !== "admin") {
    redirect("/login");
  }

  const barberosRaw = await prisma.barbero.findMany({
    where: {
      usuario: {
        id: { not: undefined },
        // EXCLUIR AL ADMIN DE LA LISTA DE BARBEROS
        email: { notIn: ['cubasamuel852@gmail.com', 'cubasamuel1852@gmail.com'] }
      }
    },
    include: {
      servicios: true,
      usuario: true
    },
    orderBy: {
      nombre: 'asc'
    }
  });

  const barberosFormateados = barberosRaw.map((barbero) => ({
    ...barbero,
    usuario: {
      ...barbero.usuario,
      // PRIORIDAD: Foto de Usuario (nueva) > Foto de Barbero (antigua)
      img: barbero.usuario.img || barbero.img
    },
    servicios: barbero.servicios.map((s: any) => ({
      ...s,
      precio: Number(s.precio)
    }))
  }));

  return <DashboardClient barberos={barberosFormateados} />;
}
