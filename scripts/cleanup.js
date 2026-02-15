
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    console.log('--- LIMPIEZA DE BASE DE DATOS ---');

    // 1. ELIMINAR CUALQUIER USUARIO QUE TENGA "PRUEBA" EN EL NOMBRE O EMAIL
    const deletedTestUsers = await prisma.usuario.deleteMany({
        where: {
            OR: [
                { email: { contains: 'prueba' } },
                { email: { contains: 'cuenta' } }, // cuenta1@gmail.com, etc.
                { nombre: { contains: 'Usuario Prueba' } }
            ]
        }
    });
    console.log(`🗑️ Usuarios de prueba eliminados: ${deletedTestUsers.count}`);

    // 2. ELIMINAR EL ADMIN ANTIGUO DUPLICADO (1852)
    const deletedOldAdmin = await prisma.usuario.deleteMany({
        where: {
            email: 'cubasamuel1852@gmail.com'
        }
    });
    console.log(`🗑️ Admin duplicado (1852) eliminado: ${deletedOldAdmin.count}`);

    // 3. ASEGURAR QUE EL ADMIN REAL (852) NO TENGA PERFIL DE BARBERO
    const realAdmin = await prisma.usuario.findUnique({
        where: { email: 'cubasamuel852@gmail.com' }
    });

    if (realAdmin) {
        const deletedBarberProfile = await prisma.barbero.deleteMany({
            where: { usuarioId: realAdmin.id }
        });
        console.log(`✂️ Perfil de barbero del Admin eliminado: ${deletedBarberProfile.count}`);
    }

    console.log('--- LIMPIEZA COMPLETADA ---');
}

cleanup()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
