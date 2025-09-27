// Backend/src/config/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'] // en dev puedes agregar 'query' si necesitas
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
