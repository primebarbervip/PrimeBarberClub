const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log("🔍 Diagnóstico iniciado...");

  // 0. Test Bcrypt
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("test", salt);
    console.log("✅ Bcrypt funcionando correctament.");
  } catch (e) {
    console.error("❌ Bcrypt falló:", e);
  }

  const email = "cubasamuel852@gmail.com";

  // 1. Check if user exists
  const existingUser = await prisma.usuario.findUnique({
    where: { email: email }
  });

  if (existingUser) {
    // 2. Update role to admin
    await prisma.usuario.update({
      where: { email: email },
      data: { rol: 'admin' }
    });
    console.log("✅ Rol de Admin asignado a:", email);
  } else {
    console.log("⚠️ Usuario no encontrado:", email);
    // Optionally create it if needed, but for now just log
  }
}
main();