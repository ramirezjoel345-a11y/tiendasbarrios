// prisma/seed.js
'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@tiendasbarrios.local';
  const name = 'Admin TiendasBarrios';
  const role = 'admin';
  const plain = 'admin123';

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log(`Seed: usuario ya existe -> ${email}`);
    return;
  }

  const hash = await bcrypt.hash(plain, 10);
  const user = await prisma.user.create({
    data: { email, name, role, password: hash },
  });

  console.log('Seed: usuario admin creado:');
  console.log({ email, password: plain, id: user.id, role: user.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
