const { PrismaClient } = require('@prisma/client');
console.log('Testing prisma client...');
try {
  const prisma = new PrismaClient();
  console.log('Prisma initialized');
} catch (err) {
  console.error(err);
}
