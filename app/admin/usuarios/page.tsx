// Al estar 'lib' dentro de 'app', subimos tres niveles para llegar a 'app' y luego entramos en 'lib'
import { prisma } from "../../lib/prisma";
import GestionUsuariosClient from "./GestionUsuariosClient";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  // 1. SEGURIDAD DE SERVIDOR
  const cookieStore = await cookies();
  const role = cookieStore.get("user_role")?.value;

  // Verificación estricta de rol
  if (role !== "admin") {
    redirect("/login");
  }

  try {
    // 2. CONSULTA USANDO EL SINGLETON (Ruta app/lib/prisma.ts)
    // @ts-ignore - En caso de que el esquema use 'usuario' o 'user'
    const usuarios = await prisma.usuario.findMany({
      where: {
        esVerificado: true
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        img: true,
        perfilBarbero: {
          select: {
            img: true
          }
        }
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return (
      <main className="min-h-screen bg-black">
        <GestionUsuariosClient usuarios={usuarios} />
      </main>
    );
  } catch (error) {
    console.error("Error en Prisma:", error);
    // Retorno de seguridad para evitar pantallas blancas
    return <GestionUsuariosClient usuarios={[]} />;
  }
}