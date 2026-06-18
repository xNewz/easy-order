import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create tables
  const tables = await Promise.all([
    prisma.table.upsert({
      where: { number: 'A1' },
      update: {},
      create: { number: 'A1' },
    }),
    prisma.table.upsert({
      where: { number: 'A2' },
      update: {},
      create: { number: 'A2' },
    }),
    prisma.table.upsert({
      where: { number: 'B1' },
      update: {},
      create: { number: 'B1' },
    }),
  ]);

  console.log('Tables seeded:', tables.map((t) => t.number));

  // Create categories
  const categoryFood = await prisma.category.create({
    data: { name: 'อาหารคาว' },
  });
  
  const categoryDrink = await prisma.category.create({
    data: { name: 'เครื่องดื่ม' },
  });

  // Create menu items
  await prisma.menuItem.create({
    data: {
      name: 'ข้าวกะเพราหมูกรอบ',
      description: 'หมูกรอบชิ้นโต ผัดกับกะเพรารสจัดจ้าน',
      price: 60,
      categoryId: categoryFood.id,
      imageUrl: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=500&q=80',
    },
  });

  await prisma.menuItem.create({
    data: {
      name: 'ต้มยำกุ้งน้ำข้น',
      description: 'กุ้งตัวโต รสชาติเข้มข้น',
      price: 150,
      categoryId: categoryFood.id,
      imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4852?w=500&q=80',
    },
  });

  await prisma.menuItem.create({
    data: {
      name: 'ชามะนาว',
      description: 'เปรี้ยวอมหวาน ชื่นใจ',
      price: 40,
      categoryId: categoryDrink.id,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
    },
  });

  console.log('Categories and menu items seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
