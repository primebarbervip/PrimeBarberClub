import { obtenerConfiguracion } from "../../actions";
import AjustesClient from "./AjustesClient";
import { Settings } from "lucide-react";

export default async function AjustesPage() {
    const config = await obtenerConfiguracion();

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans md:ml-10">
            <header className="mb-14 max-w-4xl">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Settings className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Configuración</h1>
                        <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">Sistema & Soporte Técnico</p>
                    </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-8" />
            </header>

            <AjustesClient config={config} />
        </div>
    );
}
