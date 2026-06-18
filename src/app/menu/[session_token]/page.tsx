import { prisma } from '@/lib/prisma';
import MenuClient from './MenuClient';

export default async function MenuPage({
  params,
}: {
  params: Promise<{ session_token: string }>;
}) {
  const { session_token } = await params;

  // Validate session token
  const table = await prisma.table.findUnique({
    where: { currentSessionToken: session_token },
  });

  if (!table || table.status !== 'OCCUPIED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-sm w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">QR Code ไม่ถูกต้องหรือหมดอายุ</h1>
          <p className="text-gray-600 text-sm">
            กรุณาแจ้งพนักงานเพื่อเปิดโต๊ะใหม่ หรือสแกน QR Code ใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  // Fetch Categories and Menu Items
  const categories = await prisma.category.findMany({
    include: {
      items: true,
    },
  });

  // Fetch existing orders for this session
  const orders = await prisma.order.findMany({
    where: { sessionToken: session_token },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <MenuClient table={table} categories={categories} initialOrders={orders} />;
}
