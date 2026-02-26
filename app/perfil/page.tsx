import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PerfilPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
    });

    if (!usuario) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-black">
            <header className="px-6 py-6 flex items-center gap-4 bg-black sticky top-0 z-10 border-b border-white/5">
                <Link href="/" className="p-2 -ml-2 hover:bg-zinc-900 rounded-full transition-colors">
                    <ArrowLeft className="text-white" size={20} />
                </Link>
                <h1 className="text-lg font-black tracking-tight text-white">Mi Perfil</h1>
            </header>

            <ProfileClient usuario={usuario} />
        </main>
    );
}
