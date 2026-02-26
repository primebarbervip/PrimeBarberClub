import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value;

  // --- SEGURIDAD CORREGIDA ---
  // Ahora el portero deja pasar si eres Admin O si eres Barbero.
  // Solo te saca si no eres ninguno de los dos.
  if (userRole !== "admin" && userRole !== "barbero") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black flex">
      {/* Main Content Area - Full width on mobile. Desktop has floating sidebar. */}
      <main className="flex-1 min-h-screen transition-all duration-300">
        {children}
      </main>

      {/* Navigation Component */}
      <AdminSidebar />
    </div>
  );
}