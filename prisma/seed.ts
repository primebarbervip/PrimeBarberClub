import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Iniciando Seed Profesional ---')
  const passwordHash = await bcrypt.hash('120950', 10)

  // 1. ELIMINADO: Creación automática de usuario Admin.
  // El usuario se registrará manualmente y el sistema le dará rol admin por su email.
  console.log('ℹ️ OMITIDO: Creación de usuario Admin (se debe registrar manualmente)')

  // 2. ELIMINAR 15 USUARIOS DE PRUEBA (si existieran de seeds anteriores)
  // Ya no los creamos.

  // 3. ELIMINADO: Servicio de prueba.
  // Ya no creamos servicios por defecto, el admin los creará desde el panel.
  console.log('ℹ️ OMITIDO: Creación de servicios base (limpieza total)')

  console.log('--- ✅ Seed Finalizado (Solo Admin y Servicio Base) ---')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Error en el Seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })