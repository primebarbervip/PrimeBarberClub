const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.usuario.findMany({
            select: { email: true, rol: true, nombre: true }
        });
        console.log('--- USUARIOS REGISTRADOS ---');
        console.log(JSON.stringify(users, null, 2));

        const citas = await prisma.cita.count();
        console.log('Total citas:', citas);
    } catch (e) {
        console.error('Error querying DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
