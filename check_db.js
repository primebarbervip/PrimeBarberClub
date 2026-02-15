const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.usuario.findMany({
        select: { email: true, rol: true }
    });
    console.log('--- USUARIOS EN DB ---');
    console.log(users);

    const config = await prisma.configuracion.findUnique({ where: { id: 1 } });
    console.log('--- CONFIGURACION ---');
    console.log(config);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
