import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import BarberoSidebar from "./components/BarberoSidebar";

export default async function BarberoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;
    const userId = cookieStore.get("user_id")?.value;

    // Role protection - only barbers can access
    if (userRole !== "barbero" || !userId) {
        redirect("/login");
    }

    // Fetch user data for sidebar
    const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
            nombre: true,
            img: true,
            perfilBarbero: {
                select: {
                    img: true
                }
            }
        }
    });

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex overflow-x-hidden w-full relative">
            {/* Main Content Area - Full width on mobile. Desktop has floating sidebar. */}
            <main className="flex-1 min-h-screen transition-all duration-300 w-full overflow-x-hidden">
                {children}
            </main>

            {/* Navigation Component */}
            <BarberoSidebar usuario={usuario} />
        </div>
    );
}
